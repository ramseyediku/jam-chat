interface WSData {
  userId: number;
  username: string;
  toId?: number; // Chat
  roomId?: string; // Audio
  roomType?: 'chat' | 'audio';
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

  // ===== WEBSOCKETS FOR LIVE CHAT + AUDIO =====
  websocket: {
    open(ws) {
      if (ws.data.roomType === 'audio' && ws.data.roomId) {
        // Audio: subscribe to specific room + global notifications
        ws.subscribe(`audio${ws.data.roomId}`);
        ws.subscribe('audio-global');
        console.log(
          '✅ Audio WS OPEN:',
          ws.data.username,
          'in room',
          ws.data.roomId
        );
      } else if (ws.data.toId) {
        // Chat: P2P room (existing)
        const roomId = Math.min(ws.data.userId!, ws.data.toId!);
        ws.subscribe(`chat${roomId}`);
        ws.subscribe('global');
        console.log('✅ Chat WS OPEN:', ws.data.username, 'to', ws.data.toId);
      }
    },
    message(ws, message) {
      console.log('📨 WS MSG:', ws.data.username, '->', message);
      try {
        const data =
          typeof message === 'string' ? JSON.parse(message) : message;

        if (ws.data.roomType === 'audio' && ws.data.roomId) {
          // Audio: broadcast typed events to room
          ws.publish(`audio${ws.data.roomId}`, message);
        } else if (ws.data.toId) {
          // Chat: existing P2P logic
          const roomId = Math.min(ws.data.userId!, ws.data.toId!);
          ws.publish(`chat${roomId}`, message);
        }
      } catch (e) {
        // Raw message fallback (chat-compatible)
        if (ws.data.roomType === 'audio' && ws.data.roomId) {
          ws.publish(`audio${ws.data.roomId}`, message);
        } else if (ws.data.toId) {
          const roomId = Math.min(ws.data.userId!, ws.data.toId!);
          ws.publish(`chat${roomId}`, message);
        }
      }
    },
    close(ws, code, reason) {
      console.log(`${ws.data.username} left (${ws.data.roomType || 'chat'})`);
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
        payload = await jwtVerify(token, JWTSECRET);
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
          userId: Number(payload.payload.sub),
          username: payload.payload.username,
          toId,
        },
      });

      if (!success) return new Response('Upgrade failed', { status: 400 });
    }

    // index.ts - ADD to async fetch() BEFORE chat WS
    if (
      url.pathname === '/api/audio' &&
      req.method === 'GET' &&
      req.headers.get('upgrade') === 'websocket'
    ) {
      console.log('🔄 /api/audio WS upgrade attempt'); // ← ADD

      const roomIdParam = url.searchParams.get('roomId');
      console.log('📍 roomId param:', roomIdParam); // ADD debug

      if (!roomIdParam) {
        console.log('❌ Invalid roomId:', roomIdParam); // ← ADD
        return new Response('Invalid roomId', { status: 400 });
      }

      // JWT auth (reuse chat logic)
      const token = req.headers.get('Cookie')?.match(/token=([^;]+)/)?.[1];
      if (!token) {
        console.log('❌ No token'); // ← ADD
        return new Response('Unauthorized', { status: 401 });
      }

      let payload;
      try {
        const { jwtVerify } = await import('jose');
        const JWTSECRET = new TextEncoder().encode(
          Bun.env.JWTSECRET || 'your-secret'
        );
        payload = await jwtVerify(token, JWTSECRET);
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!payload?.payload?.sub || !payload.payload.username) {
        console.log('❌ Invalid payload structure'); // ← ADD
        return new Response(JSON.stringify({ error: 'Invalid payload' }), {
          status: 401,
        });
      }

      const success = server.upgrade(req, {
        data: {
          userId: Number(payload.payload.sub),
          username: payload.payload.username,
          roomId: roomIdParam, // NEW: roomId
          roomType: 'audio', // Distinguish from chat
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
