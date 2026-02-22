import { serve } from 'bun';
import index from '../frontend/index.html';
import { Database } from 'bun:sqlite';
import { SignJWT, jwtVerify } from 'jose';

const db = new Database('dev.db');

// ===== JWT SECRET (add if missing) =====
const JWT_SECRET = new TextEncoder().encode(
  Bun.env.JWT_SECRET || 'your-secret'
);

const server = serve({
  routes: {
    // ===== API ROUTES =====

    // POST /api/register {username, age, gender}
    '/api/register': {
      POST: async (req) => {
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
      POST: async (req) => {
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
      GET: async (req) => {
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
    // Serve index.html for all unmatched routes.
    '/*': index,
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
