import { Database } from 'bun:sqlite';
import { SignJWT, jwtVerify } from 'jose';
const db = new Database('dev.db');

// ===== JWT SECRET (add if missing) =====
const JWT_SECRET = new TextEncoder().encode(
  Bun.env.JWT_SECRET || 'your-secret'
);

export const userRoutes = {
  // POST /api/register {username, age, gender}
  '/api/register': {
    POST: async (req: Request) => {
      try {
        const { username, age, gender, bio } = await req.json();

        // VALIDATION
        if (!['male', 'female'].includes(gender)) {
          return new Response(
            JSON.stringify({ error: 'Gender: male/female only' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        if (age < 18 || age > 105) {
          return new Response(JSON.stringify({ error: 'Age 18-105 only' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // INSERT USER
        const insert = db.prepare(`
          INSERT INTO users (prof_pic, username, age, gender) 
          VALUES (?, ?, ?, ?)
        `);
        const result = insert.run(
          `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=128`,
          username.toLowerCase(),
          age,
          gender
        );

        // GET USER PROFILE
        const user = db
          .prepare(
            `
          SELECT id, prof_pic, username, age, gender, level, following, fans 
          FROM users WHERE id = ?
        `
          )
          .get(result.lastInsertRowid);

        // JWT TOKEN
        const token = await new SignJWT({
          sub: user.id,
          username: user.username,
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('7d')
          .sign(JWT_SECRET);

        // COOKIE + RESPONSE
        const headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append(
          'Set-Cookie',
          `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`
        );
        return new Response(JSON.stringify({ user }), {
          status: 201,
          headers,
        });
      } catch {
        return new Response(JSON.stringify({ error: 'Username taken' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    },
  },

  // POST /api/login {username}
  '/api/login': {
    POST: async (req: Request) => {
      try {
        const { username } = await req.json();
        const user = db
          .prepare('SELECT * FROM users WHERE username = ?')
          .get(username.toLowerCase());

        if (!user) {
          return new Response(
            JSON.stringify({
              error: 'User not found. Try again or make new account.',
            }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        // JWT TOKEN
        const token = await new SignJWT({
          sub: user.id,
          username: user.username,
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('7d')
          .sign(JWT_SECRET);

        const headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append(
          'Set-Cookie',
          `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`
        );
        const profile = db
          .prepare(
            `
          SELECT id, prof_pic, username, age, gender, level, following, fans FROM users WHERE id = ?
        `
          )
          .get(user.id);

        return new Response(JSON.stringify({ user: profile }), {
          status: 200,
          headers,
        });
      } catch {
        return new Response(JSON.stringify({ error: 'Login failed' }), {
          status: 500,
        });
      }
    },
  },

  // GET /api/profile (JWT protected)
  '/api/profile': {
    GET: async (req: Request) => {
      try {
        const token = req.headers.get('Cookie')?.match(/token=([^;]+)/)?.[1];
        if (!token) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
          });
        }
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const user = db
          .prepare(
            `
          SELECT id, prof_pic, username, age, gender, level, following, fans 
          FROM users WHERE id = ?
        `
          )
          .get(payload.sub);
        return new Response(
          JSON.stringify(user || { error: 'User not found' })
        );
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
        });
      }
    },
  },

  // POST /api/logout
  '/api/logout': {
    POST: () => {
      const headers = new Headers({
        'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict',
        'Content-Type': 'application/json',
      });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers,
      });
    },
  },

  // 1. SEARCH API - Dropdown preview (lightweight)
  '/api/search': {
    GET: async (req: Request) => {
      try {
        const url = new URL(req.url, `http://${req.headers.get('host')}`);
        const query = url.searchParams.get('query')?.trim().toLowerCase();

        if (!query || query.length < 2) {
          return Response.json([], {
            headers: { 'Cache-Control': 'public, max-age=2' },
          });
        }

        const users = db
          .prepare(
            `
        SELECT id, prof_pic, username
        FROM users 
        WHERE LOWER(username) LIKE ?
        ORDER BY fans DESC
        LIMIT 8
      `
          )
          .all(`%${query}%`);

        return Response.json(users, {
          headers: { 'Cache-Control': 'public, max-age=5' },
        });
      } catch (err) {
        console.error('Search error:', err);
        return Response.json([], { status: 500 });
      }
    },
  },

  // 2. USER DETAIL API - Profile page (full data, unchanged)
  '/api/user': {
    GET: async (req: Request) => {
      try {
        const url = new URL(req.url, `http://${req.headers.get('host')}`);
        const idParam = url.searchParams.get('id');
        const usernameParam = url.searchParams.get('username')?.toLowerCase();

        let user = null;

        if (idParam) {
          user = db
            .prepare(
              `
          SELECT id, prof_pic, username, age, gender, level, following, fans, bio
          FROM users WHERE id = ?
        `
            )
            .get(Number(idParam));
        } else if (usernameParam) {
          user = db
            .prepare(
              `
          SELECT id, prof_pic, username, age, gender, level, following, fans, bio
          FROM users WHERE LOWER(username) = ?
        `
            )
            .get(usernameParam);
        } else {
          return Response.json(
            { error: 'Missing id or username' },
            { status: 400 }
          );
        }

        if (!user) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json(user);
      } catch (err) {
        console.error('User fetch error:', err);
        return Response.json(
          { error: 'Failed to fetch user' },
          { status: 500 }
        );
      }
    },
  },

  // ===== CHAT HISTORY (add to userRoutes) =====
  '/api/chat/history': {
    GET: async (req: Request) => {
      try {
        const token = req.headers.get('Cookie')?.match(/token=([^;]+)/)?.[1];
        if (!token) return new Response('Unauthorized', { status: 401 });

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const myId = payload.sub;
        const url = new URL(req.url);
        const partnerId = Number(url.searchParams.get('partnerId'));

        const history = db
          .prepare(
            `
        SELECT from_id, to_id, message, created_at
        FROM messages
        WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)
        ORDER BY created_at ASC
        LIMIT 50
      `
          )
          .all(myId, partnerId, partnerId, myId);

        return Response.json(history);
      } catch {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    },
  },

  '/api/chat/send': {
    POST: async (req: Request) => {
      try {
        const { toId, message } = await req.json();
        const token = req.headers.get('Cookie')?.match(/token=([^;]+)/)?.[1];
        if (!token)
          return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { payload } = await jwtVerify(token, JWT_SECRET);

        // SAVE TO DB
        db.prepare(
          `
        INSERT INTO messages (from_id, to_id, message)
        VALUES (?, ?, ?)
      `
        ).run(payload.sub, toId, message);

        return Response.json({ success: true });
      } catch {
        return Response.json({ error: 'Failed' }, { status: 500 });
      }
    },
  },
};
