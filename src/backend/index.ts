interface RequestData {
  userId: number;
  username: string;
}

import { serve } from 'bun';
import index from '../frontend/index.html';
import { userRoutes } from './userRoutes';

const server = serve<RequestData>({
  routes: {
    '/api/agora/token': async (req) => {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      console.log('Token req:', req.url, 'userId:', userId); // ← Add this
      if (!userId) {
        return new Response('Missing userId: ' + userId, { status: 400 });
      } else {
        console.log('Generating token for userId:', userId);
      }

      // JWT auth
      const cookieToken = req.headers
        .get('Cookie')
        ?.match(/token=([^;]+)/)?.[1];
      if (!cookieToken) return new Response('Unauthorized', { status: 401 });

      let payload;
      try {
        const { jwtVerify } = await import('jose');
        const JWTSECRET = new TextEncoder().encode(
          Bun.env.JWTSECRET || 'your-secret'
        );
        payload = await jwtVerify(cookieToken, JWTSECRET);
      } catch {
        return new Response('Invalid token', { status: 401 });
      }

      // Load UUID from file
      let uuidData: Record<string, string> = {};
      try {
        const file = Bun.file('user_uuids.json');
        if (await file.exists()) {
          uuidData = JSON.parse(await file.text());
        }
      } catch {
        // File doesn't exist or invalid JSONf
      }

      const userUuid = uuidData[userId];
      if (!userUuid)
        return new Response(
          'User not registered. Call /api/agora/register first.',
          { status: 400 }
        );

      try {
        const { ChatTokenBuilder } = await import('agora-token');
        const token = ChatTokenBuilder.buildUserToken(
          Bun.env.AGORA_APP_KEY!, // Chat AppKey (org#appId from Console)
          Bun.env.AGORA_APP_CERT!, // Chat App Certificate
          userUuid, // UUID, not username
          24 * 60 * 60 // 24h
        );
        return new Response(token);
      } catch (err) {
        console.error('Chat token error:', err);
        return new Response('Token generation failed', { status: 500 });
      }
    },

    '/api/agora/register': async (req) => {
      const { userId } = await req.json();
      // JWT auth
      const cookieToken = req.headers
        .get('Cookie')
        ?.match(/token=([^;]+)/)?.[1];

      if (!cookieToken) return new Response('Unauthorized', { status: 401 });
      const ORG_APP = ['7110029131', '1664881']; // Good

      const { ChatTokenBuilder } = await import('agora-token');
      const APP_TOKEN = ChatTokenBuilder.buildAppToken(
        Bun.env.AGORA_APP_KEY!,
        Bun.env.AGORA_APP_CERT!,
        60 * 60 * 24 // 24h
      );

      const APP_TOKEN2 =
        '007eJxTYLjTJnLO80h86/HgttBwlsalDy9f+mLiZbAhdPGyhXMZ3f8pMKSmmRolGpolGaYmpZlYmBlYmKemGhmZmJpZplmYGCanrCpbkNkQyMiw568IIyMDKwMjAxMDiM/AAADxeB9V';
      console.log(APP_TOKEN2);
      try {
        const response = await fetch(
          `https://a71.chat.agora.io/${ORG_APP[0]}/${ORG_APP[1]}/users`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${APP_TOKEN2}`,
            },
            body: JSON.stringify([{ username: userId }]),
          }
        );
        if (!response.ok) {
          const errData = await response.text();
          console.error('Register failed:', errData);
          console.log('SOMEBODY HELP ME');
          return new Response(`Register failed: ${errData}`, { status: 500 });
        }
        const data = await response.json();
        const uuid = data.entities?.[0]?.uuid;
        if (!uuid) {
          console.error('No UUID in response:', data);
          return new Response('No UUID returned from Agora', { status: 500 });
        }
        // Load existing UUIDs
        let uuidData: Record<string, string> = {};
        try {
          const file = Bun.file('user_uuids.json');
          if (await file.exists()) {
            uuidData = JSON.parse(await file.text());
          }
        } catch {
          // Ignore
        }
        // Save/update UUID
        uuidData[userId] = uuid;
        await Bun.write('user_uuids.json', JSON.stringify(uuidData, null, 2));
        console.log(`Registered ${userId} with UUID: ${uuid}`);
        return new Response('OK');
      } catch (err) {
        console.error('Register error:', err);
        return new Response('Register failed', { status: 500 });
      }
    },

    // ===== USER ROUTES =====
    ...userRoutes,
    '/*': index,
  },

  development: {
    hmr: true,
  },
});

console.log(`🚀 Agora Backend @ ${server.url}`);
