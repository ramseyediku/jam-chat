
-- users table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_image TEXT DEFAULT '',
  uniqueId INTEGER UNIQUE NOT NULL CHECK(uniqueId BETWEEN 10000000 AND 99999999),
  username TEXT UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 18 AND age <= 105),
  gender TEXT CHECK (gender IN ('male', 'female')),
  rcoins INTEGER DEFAULT 0 CHECK (rcoins >= 0),
  diamonds INTEGER DEFAULT 0 CHECK (diamonds >= 0),
  country TEXT,
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  isBlocked BOOLEAN DEFAULT 0,
  isHost BOOLEAN DEFAULT 0,
  agency TEXT DEFAULT '',
  following INTEGER DEFAULT 0 CHECK (following >= 0),
  fans INTEGER DEFAULT 0 CHECK (fans >= 0),
  blocked_users TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- follows table (bridge for followers/following)
DROP TABLE IF EXISTS follows;
CREATE TABLE follows (
  follower_id INTEGER NOT NULL,
  following_id INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);  -- ✅ Added semicolon

-- posts table
DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  locationCountry TEXT,
  visibility TEXT CHECK (visibility IN ('public', 'followers')) DEFAULT 'public',
  comments_allowed BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- likes table (posts only)
DROP TABLE IF EXISTS likes;
CREATE TABLE likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- comments table (flat)
DROP TABLE IF EXISTS comments;
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- hashtags table
DROP TABLE IF EXISTS hashtags;
CREATE TABLE hashtags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT UNIQUE NOT NULL CHECK (length(text) >= 1 AND length(text) <= 50),
  posts_count INTEGER DEFAULT 0 CHECK (posts_count >= 0)
);

-- post_hashtags junction
DROP TABLE IF EXISTS post_hashtags;
CREATE TABLE post_hashtags (
  post_id INTEGER NOT NULL,
  hashtag_id INTEGER NOT NULL,
  PRIMARY KEY (post_id, hashtag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE
);

-- post_mentions junction
DROP TABLE IF EXISTS post_mentions;
CREATE TABLE post_mentions (
  post_id INTEGER NOT NULL,
  mentioned_user_id INTEGER NOT NULL,
  PRIMARY KEY (post_id, mentioned_user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- messages table
DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_id INTEGER NOT NULL,
  to_id INTEGER NOT NULL,
  message TEXT NOT NULL CHECK (LENGTH(message) > 0 AND LENGTH(message) <= 1000),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_id) REFERENCES users(id) ON DELETE CASCADE
);

-- indexes
CREATE INDEX IF NOT EXISTS idx_conversation ON messages(from_id, to_id);
CREATE INDEX IF NOT EXISTS idx_conversation_reverse ON messages(to_id, from_id);

-- audio rooms table (minor tweak: hostId FK)
DROP TABLE IF EXISTS audiorooms;
CREATE TABLE audiorooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'public',
  hostId INTEGER REFERENCES users(id) ON DELETE SET NULL,
  imageUrl TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,  -- TEXT not DATETIME
  speakers TEXT DEFAULT '[]',
  listenerCount INTEGER DEFAULT 0
);
