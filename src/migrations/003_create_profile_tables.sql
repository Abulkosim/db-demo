CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY, 
  user_id INT NOT NULL UNIQUE, 
  bio TEXT, 
  avatar_url TEXT, 
  birth_date DATE, 
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY, 
  user_id INT NOT NULL UNIQUE, 
  email_notifications BOOLEAN DEFAULT TRUE, 
  theme TEXT DEFAULT 'light', 
  language TEXT DEFAULT 'en', 
  FOREIGN KEY (user_id) REFERENCES users(id)
);