-- schema.sql
-- users table with constraints and default values
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prof_pic TEXT DEFAULT 'https://ui-avatars.com/api/?name=User&size=128&background=0D8ABC&color=fff',
  username TEXT UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 18 AND age <= 105),
  gender TEXT CHECK (gender IN ('male', 'female')),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  following INTEGER DEFAULT 0 CHECK (following >= 0),
  fans INTEGER DEFAULT 0 CHECK (fans >= 0),
  bio TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Seed dummies
INSERT INTO users (username, age, gender, level) VALUES
('demo1', 28, 'male', 5),
('demo2', 34, 'female', 12),
('demo3', 22, 'male', 1);

-- posts table with constraints and default values
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

-- Seed dummies
INSERT INTO posts (user_id, image_url, caption, locationCountry) VALUES
(1, 'https://placekitten.com/400/400', 'Enjoying the sunshine!', 'USA'),
(2, 'https://placekitten.com/401/400', 'Had a great day at the park!', 'Canada'),
(3, 'https://placekitten.com/400/401', 'Loving this new cafe!', 'UK');