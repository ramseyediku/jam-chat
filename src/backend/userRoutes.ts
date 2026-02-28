import { Database } from 'bun:sqlite';
import { SignJWT, jwtVerify } from 'jose';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
        const data = await req.formData();
        const username = (data.get('username') as string)?.trim().toLowerCase();
        const age = parseInt((data.get('age') as string) || '0');
        const gender = data.get('gender') as string;
        const bio = (data.get('bio') as string)?.trim() || '';

        // Validation
        if (
          !username ||
          username.length < 3 ||
          !['male', 'female'].includes(gender) ||
          age < 18 ||
          age > 105
        ) {
          return Response.json({ error: 'Invalid data' }, { status: 400 });
        }

        // Unique checks
        if (
          db.prepare('SELECT id FROM users WHERE username = ?').get(username)
        ) {
          return Response.json({ error: 'Username taken' }, { status: 400 });
        }

        let uniqueId;
        do {
          uniqueId = crypto.randomInt(10000000, 99999999);
        } while (
          db.prepare('SELECT id FROM users WHERE uniqueId = ?').get(uniqueId)
        );

        // PFP upload (optional - DB defaults if omitted)
        const pfpFile = data.get('pfp') as File | null;
        if (pfpFile) {
          const bytes = await pfpFile.arrayBuffer();
          const ext = path.extname(pfpFile.name) || '.jpg';
          const filename = `pfp_${uniqueId}_${Date.now()}${ext}`;
          const filePath = path.join(
            process.cwd(),
            'uploads/profile_images',
            filename
          );
          await Bun.write(filePath, new Uint8Array(bytes));

          // Explicitly set uploaded path
          const profileImage = `/uploads/profile_images/${filename}`;

          // INSERT with uploaded PFP
          const insert = db.prepare(`
          INSERT INTO users (profile_image, uniqueId, username, age, gender, bio, country)
          VALUES (?, ?, ?, ?, ?, ?, 'United Kingdom')
        `);
          const result = insert.run(
            profileImage,
            uniqueId,
            username,
            age,
            gender,
            bio
          );

          // Rest unchanged...
          const user = db
            .prepare(
              `
          SELECT id, profile_image, uniqueId, username, age, gender, bio, country 
          FROM users WHERE id = ?
        `
            )
            .get(result.lastInsertRowid);

          // JWT + response (unchanged)
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
          return Response.json({ user }, { status: 201, headers });
        } else {
          // No PFP - DB default handles profile_image
          const insert = db.prepare(`
          INSERT INTO users (uniqueId, username, age, gender, bio, country)
          VALUES (?, ?, ?, ?, ?, 'United Kingdom')
        `);
          const result = insert.run(uniqueId, username, age, gender, bio);

          // Fetch user (profile_image auto-defaulted)
          const user = db
            .prepare(
              `
          SELECT id, profile_image, uniqueId, username, age, gender, bio, country 
          FROM users WHERE id = ?
        `
            )
            .get(result.lastInsertRowid);

          // JWT + response (same)
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
          return Response.json({ user }, { status: 201, headers });
        }
      } catch (err) {
        console.error('Register error:', err);
        return Response.json({ error: 'Registration failed' }, { status: 500 });
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
          return Response.json(
            {
              error: 'User not found. Try again or make new account.',
            },
            { status: 404 }
          );
        }

        // JWT (good)
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

        // ❌ FIX 1: profile_image → prof_pic (your schema)
        // ❌ FIX 2: Return full user (matches register)
        const profile = db
          .prepare(
            `
          SELECT id, profile_image, uniqueId, username, age, gender, bio, country, level, following, fans 
          FROM users WHERE id = ?
        `
          )
          .get(user.id);

        return Response.json(
          { user: profile },
          {
            status: 200,
            headers,
          }
        );
      } catch (err) {
        console.error('Login error:', err); // ✅ Log error
        return Response.json({ error: 'Login failed' }, { status: 500 });
      }
    },
  },

  // GET /api/profile (JWT protected)
  '/api/profile': {
    GET: async (req: Request) => {
      try {
        const token = req.headers.get('Cookie')?.match(/token=([^;]+)/)?.[1];
        if (!token) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const user = db
          .prepare(
            `
          SELECT id, profile_image, uniqueId, username, age, gender, bio, country, level, following, fans 
          FROM users WHERE id = ?
        `
          )
          .get(payload.sub);

        if (!user) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json({ user }); // ✅ Wrap in { user }
      } catch {
        return Response.json({ error: 'Invalid token' }, { status: 401 });
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

  '/api/myprofile': {
    GET: async (req: Request) => {
      try {
        const token = req.headers.get('Cookie')?.match(/token=([^;]+)/)?.[1];
        if (!token) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const user = db
          .prepare(
            `
          SELECT id, profile_image, uniqueId, username, age, gender, bio, country, 
                 rcoins, diamonds, level, following, fans, isBlocked, isHost, agency
          FROM users WHERE id = ?
        `
          )
          .get(payload.sub);

        if (!user) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json({ user });
      } catch {
        return Response.json({ error: 'Invalid token' }, { status: 401 });
      }
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
          SELECT 
            id, 
            profile_image,  -- Updated from prof_pic
            username,
            fans  -- Using fans for sorting (matches old 'ORDER BY fans DESC')
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
            SELECT 
              id, 
              profile_image,  -- Updated from prof_pic
              username, 
              age, 
              gender, 
              level, 
              following, 
              fans, 
              bio
            FROM users 
            WHERE id = ?
          `
            )
            .get(Number(idParam));
        } else if (usernameParam) {
          user = db
            .prepare(
              `
            SELECT 
              id, 
              profile_image,  -- Updated from prof_pic
              username, 
              age, 
              gender, 
              level, 
              following, 
              fans, 
              bio
            FROM users 
            WHERE LOWER(username) = ?
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

  // === POST /api/rooms ===
  // userRoutes.ts - Rooms with your existing DB (NO table creation)
  '/api/rooms': {
    POST: async (req: Request) => {
      try {
        // JWT → hostId
        const token = req.headers.get('Cookie')?.match(/token=([^;]+)/)?.[1];
        if (!token)
          return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const verified = await jwtVerify(token, JWT_SECRET);
        const hostId = Number(verified.payload.sub);

        const data = await req.formData();
        const name = data.get('name') as string;
        const description = (data.get('description') as string) || '';
        const type = (data.get('type') as string) || 'public';

        if (!name || name.length < 3) {
          return Response.json(
            { error: 'Name required (3+ chars)' },
            { status: 400 }
          );
        }

        const roomId = Date.now().toString(36);

        // INSERT (your existing rooms table)
        db.prepare(
          `
        INSERT INTO audiorooms (id, name, description, type, hostId, imageUrl)
        VALUES (?, ?, ?, ?, ?, ?)
      `
        ).run(
          roomId,
          name,
          description,
          type,
          hostId,
          '/rooms/placeholder.jpg' // TODO: upload
        );

        return Response.json({
          id: roomId,
          name,
          description,
          type,
          hostId,
          imageUrl: '/rooms/placeholder.jpg',
          createdAt: new Date().toISOString(),
          speakers: [hostId],
          listenerCount: 0,
        });
      } catch (error) {
        console.error('Room creation:', error);
        return Response.json(
          { error: 'Failed to create room' },
          { status: 500 }
        );
      }
    },
  },

  '/api/rooms/:id': {
    GET: async (req: Request) => {
      try {
        const url = new URL(req.url);
        const roomId = url.pathname.split('/').pop();

        const room = db
          .prepare('SELECT * FROM audiorooms WHERE id = ?')
          .get(roomId);
        if (!room) {
          return Response.json({ error: 'Room not found' }, { status: 404 });
        }

        return Response.json(room);
      } catch (error) {
        return Response.json({ error: 'Server error' }, { status: 500 });
      }
    },

    DELETE: async (req) => {
      const url = new URL(req.url);
      const roomId = url.pathname.split('/').pop();

      db.prepare('DELETE FROM audiorooms WHERE id = ?').run(roomId);
      return Response.json({ success: true });
    },
  },
};
