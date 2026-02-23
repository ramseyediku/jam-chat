import { Server } from 'socket.io';
import { Server as Engine } from '@socket.io/bun-engine';
import { serve } from 'bun';
import index from '../frontend/index.html';
import { userRoutes } from './userRoutes';

const server = serve({
  routes: {
    // ===== USER ROUTES =====
    ...userRoutes,

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
