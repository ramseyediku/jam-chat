interface WSData {
  userId?: number; // Legacy numeric (from users.id)
  username: string;
  authId?: string; // NEW: Supabase UUID
  toId?: number; // Chat partner (numeric)
  roomId?: string; // Audio room
  roomType?: 'chat' | 'audio';
}

import { serve } from 'bun';
import index from '../frontend/index.html';
import { userRoutes, getUserFromAuthHeader } from './userRoutes'; // Import helper
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = Bun.env.SUPABASE_URL;
const supabaseAnonKey = Bun.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const server = serve<WSData>({
  routes: {
    ...userRoutes,
    '/*': index,
  },

  websocket: {
    open(ws) {
      if (ws.data.roomType === 'audio' && ws.data.roomId) {
        ws.subscribe(`audio${ws.data.roomId}`);
        ws.subscribe('audio-global');
        console.log(
          '✅ Audio WS OPEN:',
          ws.data.username,
          'in room',
          ws.data.roomId
        );
      } else if (ws.data.toId) {
        const roomId = Math.min(Number(ws.data.userId), ws.data.toId!);
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
          ws.publish(`audio${ws.data.roomId}`, message);
        } else if (ws.data.toId) {
          const roomId = Math.min(Number(ws.data.userId), ws.data.toId!);
          ws.publish(`chat${roomId}`, message);
        }
      } catch (e) {
        if (ws.data.roomType === 'audio' && ws.data.roomId) {
          ws.publish(`audio${ws.data.roomId}`, message);
        } else if (ws.data.toId) {
          const roomId = Math.min(Number(ws.data.userId), ws.data.toId!);
          ws.publish(`chat${roomId}`, message);
        }
      }
    },
    close(ws, code, reason) {
      console.log(`${ws.data.username} left (${ws.data.roomType || 'chat'})`);
    },
  },

  async fetch(req, server) {
    const url = new URL(req.url);

    // 👈 ADD THIS BLOCK
    const origin = req.headers.get('Origin') || '';
    const allowedOrigins = ['http://localhost:3000', `${Bun.env.RENDER_URL}`];
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    };
    if (allowedOrigins.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    }
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ===== CHAT WEBSOCKET =====
    if (
      url.pathname === '/api/chat' &&
      req.method === 'GET' &&
      req.headers.get('upgrade') === 'websocket'
    ) {
      const toId = Number(url.searchParams.get('toId'));
      if (isNaN(toId)) return new Response('Bad toId', { status: 400 });

      try {
        const supabaseUser = await getUserFromAuthHeader(req);
        const { data: user } = await supabase
          .from('users')
          .select('id, username')
          .eq('auth_id', supabaseUser.id)
          .single();

        if (!user) throw new Error('Profile not found');

        const success = server.upgrade(req, {
          data: {
            userId: user.id, // Numeric users.id
            username: user.username,
            authId: supabaseUser.id, // UUID for future
            toId,
          },
        });

        if (!success) return new Response('Upgrade failed', { status: 400 });
      } catch (err: any) {
        return Response.json({ error: err.message }, { status: 401 });
      }
    }

    // ===== AUDIO WEBSOCKET =====
    if (
      url.pathname === '/api/audio' &&
      req.method === 'GET' &&
      req.headers.get('upgrade') === 'websocket'
    ) {
      const roomIdParam = url.searchParams.get('roomId');
      if (!roomIdParam) return new Response('Invalid roomId', { status: 400 });

      try {
        const supabaseUser = await getUserFromAuthHeader(req);
        const { data: user } = await supabase
          .from('users')
          .select('id, username')
          .eq('auth_id', supabaseUser.id)
          .single();

        if (!user) throw new Error('Profile not found');

        const success = server.upgrade(req, {
          data: {
            userId: user.id,
            username: user.username,
            authId: supabaseUser.id,
            roomId: roomIdParam,
            roomType: 'audio',
          },
        });

        if (!success) return new Response('Upgrade failed', { status: 400 });
      } catch (err: any) {
        return Response.json({ error: err.message }, { status: 401 });
      }
    }

    return undefined;
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
