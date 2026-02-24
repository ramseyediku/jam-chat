interface WSData {
  userId: number;
  username: string;
  toId?: number; // ← ADD THIS
}

import { serve } from 'bun';
import index from '../frontend/index.html';
import { userRoutes } from './userRoutes';

const server = serve<WSData>({
  routes: {
    // ===== USER ROUTES =====
    ...userRoutes,
    '/*': index,
  },

  // ===== WEBSOCKETS FOR LIVE CHAT =====
  websocket: {
    open(ws) {
      const roomId = Math.min(ws.data.userId!, ws.data.toId!); // ← ONLY THIS LINE
      console.log('✅ WS OPEN:', ws.data.username, 'to', ws.data.toId);
      ws.subscribe(`chat${roomId}`);
      ws.subscribe('global');
      console.log(`${ws.data.username} joined chat room ${roomId}`);
    },
    message(ws, message) {
      console.log('📨 WS MSG:', ws.data.username, '->', message);
      const roomId = Math.min(ws.data.userId!, ws.data.toId!);
      ws.publish(`chat${roomId}`, message);
    },
    close(ws, code, reason) {
      console.log(`${ws.data.username} left chat`);
      console.log(
        '❌ WS CLOSE:',
        ws.data.username,
        'code:',
        code,
        'reason:',
        reason
      );
    },
  },

  // ===== CONNECTION UPGRADE FOR WEBSOCKETS =====
  async fetch(req, server) {
    const url = new URL(req.url);
    if (
      url.pathname === '/api/chat' &&
      req.method === 'GET' &&
      req.headers.get('upgrade') === 'websocket'
    ) {
      const toId = Number(url.searchParams.get('toId'));
      if (isNaN(toId)) return new Response('Bad toId', { status: 400 });

      // JWT (reuse logic - paste your exact token parsing from userRoutes)
      const token = req.headers.get('Cookie')?.match(/token=([^;]+)/)?.[1];
      if (!token)
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });

      let payload;
      try {
        const { jwtVerify } = await import('jose');
        const JWTSECRET = new TextEncoder().encode(
          Bun.env.JWTSECRET || 'your-secret'
        );
        payload = await jwtVerify(token, JWTSECRET); // payload = { payload: { sub, username }, ... }
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!payload?.payload?.sub || !payload.payload.username) {
        return new Response(JSON.stringify({ error: 'Invalid payload' }), {
          status: 401,
        });
      }

      const success = server.upgrade(req, {
        data: {
          userId: Number(payload.payload.sub), // payload.payload.sub
          username: payload.payload.username, // payload.payload.username
          toId,
        },
      });

      if (!success) return new Response('Upgrade failed', { status: 400 });
    }
    // Fall through to routes unchanged
    return undefined;
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
