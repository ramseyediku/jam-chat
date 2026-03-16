import { createClient } from '@supabase/supabase-js';
import path from 'path';
import crypto from 'crypto';

const renderUrl = process.env.RENDER_URL;

const allowedOrigins = ['http://localhost:3000', 'http://jamchat.online'];

//cors handler function
const withCors = (handler: (req: Request) => Response | Promise<Response>) => {
  return async (req: Request) => {
    const origin = req.headers.get('Origin') || '';
    console.log('🌐 CORS Origin:', origin);
    console.log('Origin: list', allowedOrigins);

    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0],
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      Vary: 'Origin',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const response = await handler(req);
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v));
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  };
};

// ===== SUPABASE DETAILS =====
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_URL;
const serviceApiKey = process.env.SERVICE_API_KEY;

// Admin client (service_role key - full perms, bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, serviceApiKey);
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper: map stored filename → public URL
const withProfileUrl = (user: any | null) => {
  if (!user) return user;
  if (!user.profile_image) return { ...user, profile_image_url: null };

  const { data } = supabase.storage
    .from('profile-images')
    .getPublicUrl(user.profile_image); // profile_image is just filename

  return { ...user, profile_image_url: data.publicUrl };
};

// ===== NEW SUPABASE AUTH HELPER =====
export const getUserFromAuthHeader = async (req: Request): Promise<any> => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No Bearer token');
  }
  const token = authHeader.split(' ')[1];

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error('Invalid token');
  return user;
};

const getUserFromCookie = async (req: Request) => {
  const token = req.headers
    .get('Cookie')
    ?.match(/sb-access-token=([^;]+)/)?.[1];
  if (!token) throw new Error('No access token cookie');
  return getUserFromAuthHeader(
    new Request('', {
      headers: new Headers({ Authorization: `Bearer ${token}` }),
    })
  );
};

export const userRoutes = {
  // POST /api/register
  '/api/register': {
    POST: withCors(async (req: Request) => {
      try {
        const data = await req.formData();
        const username = (data.get('username') as string)?.trim().toLowerCase();
        const age = parseInt((data.get('age') as string) || '0');
        const gender = data.get('gender') as string;
        const bio = (data.get('bio') as string)?.trim() || '';

        // General Validation
        if (
          !username ||
          username.length < 3 ||
          !['male', 'female'].includes(gender) ||
          age < 18 ||
          age > 105
        ) {
          return Response.json({ error: 'Invalid data' }, { status: 400 });
        }

        // Unique username check
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('username', username)
          .single();
        if (existingUser) {
          return Response.json({ error: 'Username taken' }, { status: 400 });
        }

        // 1. Generate uniqueid
        let uniqueid: number;
        let existingId;
        do {
          uniqueid = crypto.randomInt(10000000, 99999999);
          ({ data: existingId } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('uniqueid', uniqueid)
            .single());
        } while (existingId);

        // 2. Insert profile
        const { data: insertedUser, error: profileError } = await supabaseAdmin
          .from('users')
          .insert({
            uniqueid,
            username,
            age,
            gender,
            bio,
            country: 'United Kingdom',
          })
          .select(
            'id, profile_image, uniqueid, username, age, gender, bio, country'
          )
          .single();

        console.log('INSERTED:', insertedUser);

        if (profileError || !insertedUser) {
          console.error('Profile error:', profileError);
          return Response.json({ error: 'Profile failed' }, { status: 500 });
        }

        // 3. PFP upload + update
        const pfpFile = data.get('pfp') as File | null;
        let profileFilename = null;

        if (pfpFile) {
          const bytes = await pfpFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const ext = path.extname(pfpFile.name) || '.jpg';
          profileFilename = `pfp_${uniqueid}_${Date.now()}${ext}`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from('profile-images')
            .upload(profileFilename, buffer, {
              cacheControl: '3600',
              upsert: true,
              contentType: pfpFile.type || 'image/jpeg',
            });

          if (!uploadError) {
            // Update with real auth_id
            await supabaseAdmin
              .from('users')
              .update({ profile_image: profileFilename })
              .eq('id', insertedUser.id);
            console.log('PFP updated');
          } else {
            console.error('PFP upload failed:', uploadError);
          }
        }

        // 4. Final profile (with PFP URL)
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select(
            'id, profile_image, uniqueid, username, age, gender, bio, country'
          )
          .eq('id', insertedUser.id)
          .single();

        const profile = withProfileUrl(dbUser!);

        // 5. Set auth cookie
        const headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append(
          'Set-Cookie',
          `auth-id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
        );
        headers.append(
          'Set-Cookie',
          `user-id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
        );
        headers.append(
          `Set-Cookie`,
          `auth-id=${insertedUser.id}; HttpOnly; Path=/; Max-Age=2592000; SameSite=None; Secure`
        );

        return Response.json(
          { user: profile, message: 'Registered!' },
          { status: 201, headers }
        );
      } catch (err) {
        console.error('Register error:', err);
        return Response.json({ error: 'Server error' }, { status: 500 });
      }
    }),
  },

  // POST /api/login
  '/api/login': {
    POST: withCors(async (req: Request) => {
      console.log('login endpoint');
      const origin = req.headers.get('Origin') || '';
      console.log('🧪 Test Origin:', origin);

      try {
        // 1. Extract auth-id cookie
        const authIdCookie = req.headers
          .get('cookie')
          ?.match(/auth-id=([^;]+)/)?.[1];

        if (!authIdCookie) {
          return Response.json(
            { error: 'Please log in on this device to continue.' },
            { status: 401 }
          );
        }

        // 2. Fetch user by auth-id
        const { data: user, error: findError } = await supabaseAdmin
          .from('users')
          .select(
            'id, profile_image, uniqueid, username, age, gender, bio, country, level, following, fans'
          )
          .eq('id', authIdCookie)
          .single();

        if (findError || !user) {
          return Response.json(
            { error: 'No account on this device. Create one to continue.' },
            { status: 404 }
          );
        }
        const profile = withProfileUrl(user);
        return Response.json(
          { user: profile, loggedIn: true },
          { status: 200 }
        );
      } catch (err) {
        console.error('Login check error:', err);
        return Response.json({ error: 'Login check failed' }, { status: 500 });
      }
    }),
  },

  // POST /api/logout
  '/api/logout': {
    POST: withCors(async (req: Request) => {
      try {
        // Optional: Verify user before clearing (good practice)
        await getUserFromAuthHeader(req).catch(() => {}); // Silent fail OK

        // Clear HttpOnly cookie
        const headers = new Headers({
          'Set-Cookie':
            'sb-access-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure',
          'Content-Type': 'application/json',
        });

        return Response.json(
          { success: true },
          {
            status: 200,
            headers,
          }
        );
      } catch {
        // Even if invalid token, clear cookie anyway
        const headers = new Headers({
          'Set-Cookie':
            'sb-access-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure',
          'Content-Type': 'application/json',
        });
        return Response.json({ success: true }, { status: 200, headers });
      }
    }),
  },

  // GET /api/profile (protected - uses new auth helper)
  '/api/profile': {
    GET: withCors(async (req: Request) => {
      try {
        const supabaseUser = await getUserFromAuthHeader(req);

        // Fetch custom profile by auth_id (UUID)
        const { data: user, error } = await supabase
          .from('users')
          .select(
            'id, profile_image, uniqueid, username, age, gender, bio, country, rcoins, diamonds, level, following, fans, isBlocked, isHost, agency'
          )
          .eq('id', supabaseUser.id)
          .single();

        if (error || !user) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json({ user: withProfileUrl(user) });
      } catch (err: any) {
        console.error('Profile error:', err);
        return Response.json({ error: err.message }, { status: 401 });
      }
    }),
  },

  // GET /api/myprofile (fetches all details of currently logged in user)
  '/api/myprofile': {
    GET: withCors(async (req: Request) => {
      try {
        // NEW: Cookie‑based auth (matches register)
        const userIdCookie = parseInt(
          req.headers.get('cookie')?.match(/auth-id=([^;]+)/)?.[1]
        );

        if (!userIdCookie) {
          return Response.json({ error: 'No session' }, { status: 401 });
        }

        // Fetch profile by user.id (stable!)
        const { data: user, error } = await supabaseAdmin // Admin bypasses RLS
          .from('users')
          .select(
            'id, profile_image, uniqueid, username, age, gender, bio, country, rcoins, diamonds, level, following, fans, isblocked, ishost, agency'
          )
          .eq('id', userIdCookie)
          .single();

        console.log('User ID from cookie:', userIdCookie);
        console.log('Profile:', user);

        if (error || !user) {
          console.error('Profile error:', error);
          return Response.json({ error: 'Profile not found' }, { status: 404 });
        }

        const profile = withProfileUrl(user);
        console.log(profile);
        return Response.json({ user: withProfileUrl(user) });
      } catch (err: any) {
        console.error('Myprofile error:', err.message);
        return Response.json({ error: 'Server error' }, { status: 500 });
      }
    }),
  },

  // 1. SEARCH API - Dropdown preview
  '/api/search': {
    GET: withCors(async (req: Request) => {
      try {
        const url = new URL(req.url, `http://${req.headers.get('host')}`);
        const query = url.searchParams.get('query')?.trim().toLowerCase();

        if (!query || query.length < 2) {
          return Response.json([], {
            headers: { 'Cache-Control': 'public, max-age=2' },
          });
        }

        const { data: users, error } = await supabaseAdmin
          .from('users')
          .select('id, profile_image, username, fans, following')
          .ilike('username', `%${query}%`)
          .order('fans', { ascending: false })
          .limit(8);

        if (error || !users) {
          console.error('Full database search error:', error);
          return Response.json([], { status: 500 });
        }
        const usersWithUrls = users.map(withProfileUrl);

        return Response.json(usersWithUrls, {
          headers: { 'Cache-Control': 'public, max-age=5' },
        });
      } catch (err) {
        console.error('Search error:', err);
        return Response.json([], { status: 500 });
      }
    }),
  },

  // 2. USER DETAIL API - Profile page
  '/api/user': {
    GET: withCors(async (req: Request) => {
      try {
        const url = new URL(req.url, `http://${req.headers.get('host')}`);
        const idParam = url.searchParams.get('id');
        const usernameParam = url.searchParams.get('username')?.toLowerCase();

        let user = null;

        if (idParam) {
          const { data, error } = await supabaseAdmin
            .from('users')
            .select(
              'id, profile_image, username, age, gender, level, following, fans, bio'
            )
            .eq('id', Number(idParam))
            .single();
          if (error) throw error;
          user = data;
        } else if (usernameParam) {
          const { data, error } = await supabaseAdmin
            .from('users')
            .select(
              'id, profile_image, username, age, gender, level, following, fans, bio'
            )
            .eq('username', usernameParam)
            .single();
          if (error) throw error;
          user = data;
        } else {
          return Response.json(
            { error: 'Missing id or username' },
            { status: 400 }
          );
        }

        if (!user) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json(withProfileUrl(user));
      } catch (err) {
        console.error('User fetch error:', err);
        return Response.json(
          { error: 'Failed to fetch user' },
          { status: 500 }
        );
      }
    }),
  },

  // GET /api/chat/history?partnerId=uuid (Supabase)
  '/api/chat/history': {
    GET: withCors(async (req: Request) => {
      try {
        const supabaseUser = await getUserFromAuthHeader(req);
        const myId = supabaseUser.id;

        const url = new URL(req.url);
        const partnerUsername = url.searchParams.get('partnerId');
        if (!partnerUsername)
          return Response.json({ error: 'Missing partnerId' }, { status: 400 });

        // Resolve partner (use supabaseAdmin for consistency)
        const { data: partner, error: partnerError } = await supabaseAdmin
          .from('users')
          .select('auth_id')
          .eq('username', partnerUsername.toLowerCase().trim())
          .single();

        if (partnerError || !partner)
          return Response.json({ error: 'Partner not found' }, { status: 404 });

        // Query leverages your indexes
        const { data: history, error } = await supabaseAdmin
          .from('messages')
          .select('from_id, to_id, message, created_at')
          .or(
            `and(from_id.eq.${myId},to_id.eq.${partner.auth_id}),and(from_id.eq.${partner.auth_id},to_id.eq.${myId})`
          )
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;
        return Response.json(history || []);
      } catch (err) {
        console.error('Chat history:', err);
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }),
  },

  // POST /api/chat/send { toId: 'username', message: 'hello' } (Supabase + new auth)
  '/api/chat/send': {
    POST: withCors(async (req: Request) => {
      try {
        const supabaseUser = await getUserFromAuthHeader(req);
        const myId = supabaseUser.id;

        const { toId: partnerUsername, message } = await req.json();
        if (
          !partnerUsername ||
          typeof message !== 'string' ||
          message.trim().length === 0
        ) {
          return Response.json(
            { error: 'Missing partner username or empty message' },
            { status: 400 }
          );
        }

        const { data: partner, error: partnerError } = await supabaseAdmin
          .from('users')
          .select('auth_id')
          .eq('username', partnerUsername.toLowerCase().trim())
          .single();

        if (partnerError || !partner) {
          return Response.json({ error: 'Partner not found' }, { status: 404 });
        }

        const { error: insertError } = await supabaseAdmin
          .from('messages')
          .insert({
            from_id: myId,
            to_id: partner.auth_id,
            message: message.trim(),
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          return Response.json(
            { error: 'Failed to send message' },
            { status: 500 }
          );
        }

        return Response.json({ success: true });
      } catch (err) {
        console.error('Chat send error:', err);
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }),
  },

  // POST /api/rooms (create room - protected)
  '/api/rooms': {
    POST: withCors(async (req: Request) => {
      try {
        const supabaseUser = await getUserFromAuthHeader(req);
        const hostAuthId = supabaseUser.id;

        const { data: host, error: hostError } = await supabaseAdmin
          .from('users')
          .select('id, username')
          .eq('auth_id', hostAuthId)
          .single();

        if (hostError || !host)
          return Response.json({ error: 'Profile not found' }, { status: 404 });

        const formData = await req.formData();
        const name = (formData.get('name') as string)?.trim();
        const description =
          (formData.get('description') as string)?.trim() || '';
        const type = (formData.get('type') as string) || 'public';

        if (!name || name.length < 3) {
          return Response.json(
            { error: 'Name required (3+ chars)' },
            { status: 400 }
          );
        }

        const roomId = `room_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 8)}`;

        const { data: room, error } = await supabaseAdmin
          .from('audiorooms')
          .insert({
            id: roomId,
            name,
            description,
            type,
            host_auth_id: hostAuthId,
            host_user_id: host.id,
            host_username: host.username,
            image_url: '/rooms/placeholder.jpg',
            listener_count: 0,
          })
          .select()
          .single();

        if (error) {
          console.error('Room insert:', error);
          return Response.json(
            { error: 'Failed to create room' },
            { status: 500 }
          );
        }

        return Response.json({
          id: room.id,
          name: room.name,
          description: room.description,
          type: room.type,
          hostId: host.id,
          hostAuthId: hostAuthId,
          imageUrl: room.image_url,
          createdAt: room.created_at,
          speakers: [host.id],
          listenerCount: 0,
        });
      } catch (error) {
        console.error('Room creation:', error);
        return Response.json(
          { error: 'Unauthorized or server error' },
          { status: 401 }
        );
      }
    }),
  },

  // GET/DELETE /api/rooms/:id (Supabase)
  '/api/rooms/:id': {
    GET: withCors(async (req: Request) => {
      try {
        const url = new URL(req.url);
        const roomId = decodeURIComponent(url.pathname.split('/').pop() || '');

        const { data: room, error } = await supabase
          .from('audiorooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (error || !room) {
          return Response.json({ error: 'Room not found' }, { status: 404 });
        }

        return Response.json(room, {
          headers: { 'Cache-Control': 'public, max-age=10' },
        });
      } catch (error) {
        console.error('Get room error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
      }
    }),

    DELETE: withCors(async (req: Request) => {
      try {
        const supabaseUser = await getUserFromAuthHeader(req);
        const url = new URL(req.url);
        const roomId = decodeURIComponent(url.pathname.split('/').pop() || '');

        // Verify ownership
        const { data: room } = await supabase
          .from('audiorooms')
          .select('host_auth_id')
          .eq('id', roomId)
          .single();

        if (!room || room.host_auth_id !== supabaseUser.id) {
          return Response.json(
            { error: 'Not authorized to delete' },
            { status: 403 }
          );
        }

        const { error } = await supabase
          .from('audiorooms')
          .delete()
          .eq('id', roomId);

        if (error) {
          console.error('Delete error:', error);
          return Response.json({ error: 'Failed to delete' }, { status: 500 });
        }

        return Response.json({ success: true });
      } catch (err: any) {
        console.error('Delete room:', err);
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }),
  },

  '/api/posts': {
    POST: withCors(async (req: Request) => {
      try {
        // Get user from cookie

        const userIdCookie = parseInt(
          req.headers.get('cookie')?.match(/auth-id=([^;]+)/)?.[1]
        );

        if (isNaN(userIdCookie)) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const imageFile = formData.get('image') as File;
        const caption = (formData.get('caption') as string)?.trim() || '';
        const locationcountry = 'United Kingdom';
        const visibility = 'public';
        if (!imageFile || !caption || caption.length < 1) {
          return Response.json(
            { error: 'Missing image or caption' },
            { status: 400 }
          );
        }

        // 1. Upload image
        const bytes = await imageFile.arrayBuffer();
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const filename = `post_${userIdCookie}_${Date.now()}.${ext}`;

        const { data: uploadData, error: uploadError } =
          await supabaseAdmin.storage
            .from('post-images') // New bucket or reuse profile-images
            .upload(filename, bytes, {
              contentType: imageFile.type || 'image/jpeg',
              cacheControl: '3600',
              upsert: false,
            });

        if (uploadError || !uploadData) {
          console.error('Upload failed:', uploadError);
          return Response.json(
            { error: 'Image upload failed' },
            { status: 500 }
          );
        }

        const imageUrl = `${supabaseUrl}/storage/v1/object/public/post-images/${filename}`;

        // 2. Insert post
        const { data: post, error: postError } = await supabaseAdmin
          .from('posts')
          .insert({
            user_id: userIdCookie,
            image_url: imageUrl,
            caption,
            locationcountry,
            visibility,
          })
          .select('id, user_id, image_url, caption, created_at')
          .single();

        if (postError) {
          console.error('Post insert failed:', postError);
          return Response.json(
            { error: 'Post creation failed' },
            { status: 500 }
          );
        }

        return Response.json(
          {
            post,
            message: 'Post created!',
          },
          { status: 201 }
        );
      } catch (err) {
        console.error('Posts error:', err);
        return Response.json({ error: 'Server error' }, { status: 500 });
      }
    }),

    GET: withCors(async (req: Request) => {
      try {
        const { data: posts, error } = await supabaseAdmin
          .from('posts')
          .select(
            `
        id,
        user_id,
        image_url,
        caption,
        locationcountry,
        visibility,
        created_at,
        users!posts_user_id_fkey(username,profile_image)
      `
          )
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Posts fetch error:', error);
          return Response.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
          );
        }

        // 👈 Apply your helper to each post's user
        const postsWithProfile =
          posts?.map((post) => ({
            ...post,
            users: withProfileUrl(post.users),
          })) || [];

        return Response.json({ posts: postsWithProfile });
      } catch (err) {
        console.error('GET posts error:', err);
        return Response.json({ error: 'Server error' }, { status: 500 });
      }
    }),
  },

  '/api/test-users': {
    GET: withCors(async (req: Request) => {
      console.log('hey');
      const origin = req.headers.get('Origin') || '';
      console.log('🧪 Test Origin:', origin); // Logs your client origin

      try {
        const {
          data: users,
          error,
          count,
        } = await supabaseAdmin
          .from('users')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        return Response.json(
          {
            success: true,
            origin, // Echo for CORS debug
            timestamp: new Date().toISOString(),
            users: users || [],
            total: count || 0,
            message: `Found ${count || 0} users - CORS test passed if you see this!`,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
            },
          }
        );
      } catch (err) {
        console.error('Test endpoint error:', err);
        return Response.json({ error: err.message }, { status: 500 });
      }
    }),
  },
};
