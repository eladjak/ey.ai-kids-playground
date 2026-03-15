-- Sipurai Phase 3: Database Schema
-- 11 tables (User stays on Base44 auth for Phase 4)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── BOOKS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by TEXT NOT NULL,
  created_by_name TEXT,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  moral TEXT DEFAULT '',
  art_style TEXT DEFAULT 'cartoon',
  length TEXT DEFAULT 'medium',
  genre TEXT DEFAULT '',
  age_range TEXT DEFAULT '',
  language TEXT DEFAULT 'english',
  child_name TEXT DEFAULT '',
  child_age INTEGER,
  child_gender TEXT DEFAULT 'neutral',
  tone TEXT DEFAULT '',
  interests TEXT DEFAULT '',
  family_members TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  cover_image TEXT DEFAULT '',
  total_pages INTEGER DEFAULT 0,
  child_names JSONB DEFAULT '[]',
  selected_characters JSONB DEFAULT '[]',
  created_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_books_created_by ON books(created_by);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_created_date ON books(created_date DESC);

-- ─── PAGES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by TEXT NOT NULL,
  book_id UUID NOT NULL,
  page_number INTEGER NOT NULL DEFAULT 0,
  text_content TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  image_prompt TEXT DEFAULT '',
  layout_type TEXT DEFAULT 'standard',
  created_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pages_book_id ON pages(book_id);

-- ─── CHARACTERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  age INTEGER DEFAULT 5,
  gender TEXT DEFAULT 'neutral',
  personality TEXT DEFAULT '',
  appearance TEXT DEFAULT '',
  art_style TEXT DEFAULT 'cartoon',
  primary_image_url TEXT DEFAULT '',
  created_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_characters_created_by ON characters(created_by);

-- ─── COMMUNITY (posts) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by TEXT NOT NULL,
  book_id UUID,
  user_id TEXT,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  tags JSONB DEFAULT '[]',
  visibility TEXT DEFAULT 'public',
  likes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  featured_date TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_community_visibility ON community(visibility);
CREATE INDEX IF NOT EXISTS idx_community_is_featured ON community(is_featured);
CREATE INDEX IF NOT EXISTS idx_community_created_date ON community(created_date DESC);

-- ─── COMMENTS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by TEXT NOT NULL,
  community_id UUID NOT NULL,
  user_id TEXT,
  content TEXT NOT NULL DEFAULT '',
  parent_id UUID,
  created_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comments_community_id ON comments(community_id);

-- ─── COLLABORATIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by TEXT NOT NULL,
  book_id UUID,
  collaborator_id TEXT,
  collaborator_email TEXT,
  status TEXT DEFAULT 'pending',
  created_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_collaborations_book_id ON collaborations(book_id);

-- ─── FEEDBACK ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by TEXT NOT NULL,
  book_id UUID,
  page_id UUID,
  user_id TEXT,
  content TEXT DEFAULT '',
  rating INTEGER,
  feedback_type TEXT DEFAULT 'general',
  is_suggestion BOOLEAN DEFAULT FALSE,
  privacy TEXT DEFAULT 'public',
  status TEXT DEFAULT 'pending',
  created_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feedback_book_id ON feedback(book_id);

-- ─── STORY IDEAS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS story_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  plot_points JSONB DEFAULT '[]',
  character_development TEXT DEFAULT '',
  moral_lesson TEXT DEFAULT '',
  language TEXT DEFAULT '',
  parameters JSONB,
  created_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_story_ideas_created_by ON story_ideas(created_by);

-- ─── USER BADGES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  earned_date TEXT,
  progress NUMERIC DEFAULT 0,
  created_by TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- ─── FOLLOWS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by TEXT NOT NULL,
  follower_email TEXT NOT NULL,
  following_email TEXT NOT NULL,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_email, following_email)
);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_email);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_email);

-- ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by TEXT,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT DEFAULT '',
  message TEXT DEFAULT '',
  link TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  created_date TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON notifications(user_email);

-- ─── RLS: Enable + Permissive Policies ──────────────────────────────────────
-- Phase 3: Allow anon access (secureEntity handles client-side auth)
-- Phase 4: Will tighten with Clerk/Supabase auth
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN VALUES ('books'), ('pages'), ('characters'), ('community'),
    ('comments'), ('collaborations'), ('feedback'), ('story_ideas'),
    ('user_badges'), ('follows'), ('notifications')
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('CREATE POLICY "allow_select" ON %I FOR SELECT TO anon, authenticated USING (true)', tbl);
    EXECUTE format('CREATE POLICY "allow_insert" ON %I FOR INSERT TO anon, authenticated WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY "allow_update" ON %I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY "allow_delete" ON %I FOR DELETE TO anon, authenticated USING (true)', tbl);
  END LOOP;
END $$;
