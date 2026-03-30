-- ═══════════════════════════════════════════════════════════════════════════
-- Sipurai — RLS Migration: Replace open policies with Clerk JWT auth
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Prerequisites:
--   1. Clerk Third-Party Auth enabled in Supabase dashboard
--   2. Clerk JWT template "supabase" configured with: sub, email, iss, aud
--   3. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
--
-- Run this ONCE in Supabase SQL Editor after enabling Clerk Third-Party Auth.
--
-- Policy logic:
--   - SELECT: public (anyone can read books, community posts, etc.)
--   - INSERT: authenticated only, auto-stamps created_by with user email
--   - UPDATE: owner only (created_by matches JWT email)
--   - DELETE: owner only
--
-- The created_by field stores the user's email (from Clerk JWT 'email' claim).
-- auth.jwt() ->> 'email' extracts the email from the Clerk-issued JWT.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Step 1: Drop ALL existing permissive policies ──────────────────────────
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN VALUES ('books'), ('pages'), ('characters'), ('community'),
    ('comments'), ('collaborations'), ('feedback'), ('story_ideas'),
    ('user_badges'), ('follows'), ('notifications')
  LOOP
    -- Drop old wide-open policies
    EXECUTE format('DROP POLICY IF EXISTS "allow_select" ON %I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "allow_insert" ON %I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "allow_update" ON %I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "allow_delete" ON %I', tbl);
  END LOOP;
END $$;

-- ─── Step 2: Content tables — public read, owner write ──────────────────────
-- Tables where anyone can read but only the creator can modify.

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN VALUES ('books'), ('characters'), ('community'), ('story_ideas'),
    ('collaborations'), ('feedback')
  LOOP
    -- Anyone can read (including unauthenticated visitors browsing)
    EXECUTE format(
      'CREATE POLICY "public_read" ON %I FOR SELECT TO anon, authenticated USING (true)',
      tbl
    );

    -- Only authenticated users can create, stamped with their email
    EXECUTE format(
      'CREATE POLICY "auth_insert" ON %I FOR INSERT TO authenticated WITH CHECK (
        created_by = (auth.jwt() ->> ''email'')
      )',
      tbl
    );

    -- Only the owner can update their own records
    EXECUTE format(
      'CREATE POLICY "owner_update" ON %I FOR UPDATE TO authenticated USING (
        created_by = (auth.jwt() ->> ''email'')
      ) WITH CHECK (
        created_by = (auth.jwt() ->> ''email'')
      )',
      tbl
    );

    -- Only the owner can delete their own records
    EXECUTE format(
      'CREATE POLICY "owner_delete" ON %I FOR DELETE TO authenticated USING (
        created_by = (auth.jwt() ->> ''email'')
      )',
      tbl
    );
  END LOOP;
END $$;

-- ─── Step 3: Pages table — tied to book ownership ───────────────────────────
-- Pages belong to books. Owner check via the parent book's created_by.

CREATE POLICY "public_read" ON pages
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "auth_insert" ON pages
  FOR INSERT TO authenticated WITH CHECK (
    created_by = (auth.jwt() ->> 'email')
  );

CREATE POLICY "owner_update" ON pages
  FOR UPDATE TO authenticated USING (
    created_by = (auth.jwt() ->> 'email')
  ) WITH CHECK (
    created_by = (auth.jwt() ->> 'email')
  );

CREATE POLICY "owner_delete" ON pages
  FOR DELETE TO authenticated USING (
    created_by = (auth.jwt() ->> 'email')
  );

-- ─── Step 4: Comments — public read, auth write, owner delete ───────────────

CREATE POLICY "public_read" ON comments
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "auth_insert" ON comments
  FOR INSERT TO authenticated WITH CHECK (
    created_by = (auth.jwt() ->> 'email')
  );

-- Comment authors can edit their own comments
CREATE POLICY "owner_update" ON comments
  FOR UPDATE TO authenticated USING (
    created_by = (auth.jwt() ->> 'email')
  ) WITH CHECK (
    created_by = (auth.jwt() ->> 'email')
  );

CREATE POLICY "owner_delete" ON comments
  FOR DELETE TO authenticated USING (
    created_by = (auth.jwt() ->> 'email')
  );

-- ─── Step 5: User badges — user can only see/modify their own ───────────────

CREATE POLICY "own_read" ON user_badges
  FOR SELECT TO authenticated USING (
    user_email = (auth.jwt() ->> 'email')
  );

CREATE POLICY "own_insert" ON user_badges
  FOR INSERT TO authenticated WITH CHECK (
    user_email = (auth.jwt() ->> 'email')
  );

CREATE POLICY "own_update" ON user_badges
  FOR UPDATE TO authenticated USING (
    user_email = (auth.jwt() ->> 'email')
  ) WITH CHECK (
    user_email = (auth.jwt() ->> 'email')
  );

-- No delete policy — badges are permanent

-- ─── Step 6: Follows — auth users manage their own follows ──────────────────

CREATE POLICY "public_read" ON follows
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "own_insert" ON follows
  FOR INSERT TO authenticated WITH CHECK (
    follower_email = (auth.jwt() ->> 'email')
  );

CREATE POLICY "own_delete" ON follows
  FOR DELETE TO authenticated USING (
    follower_email = (auth.jwt() ->> 'email')
  );

-- ─── Step 7: Notifications — user can only see their own ────────────────────

CREATE POLICY "own_read" ON notifications
  FOR SELECT TO authenticated USING (
    user_email = (auth.jwt() ->> 'email')
  );

CREATE POLICY "system_insert" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "own_update" ON notifications
  FOR UPDATE TO authenticated USING (
    user_email = (auth.jwt() ->> 'email')
  );

CREATE POLICY "own_delete" ON notifications
  FOR DELETE TO authenticated USING (
    user_email = (auth.jwt() ->> 'email')
  );

-- ─── Step 8: Subscriptions — restrict to service_role + own read ────────────

DROP POLICY IF EXISTS "allow_select" ON subscriptions;
DROP POLICY IF EXISTS "allow_insert" ON subscriptions;
DROP POLICY IF EXISTS "allow_update" ON subscriptions;
DROP POLICY IF EXISTS "allow_delete" ON subscriptions;

-- Users can only read their own subscription
CREATE POLICY "own_read" ON subscriptions
  FOR SELECT TO authenticated USING (
    user_email = (auth.jwt() ->> 'email')
  );

-- Only service_role (webhook) can insert/update subscriptions.
-- No policy needed — service_role bypasses RLS automatically.
-- Anon and authenticated roles cannot modify subscriptions.

-- ═══════════════════════════════════════════════════════════════════════════
-- IMPORTANT: After running this migration:
--   1. Verify in Supabase Dashboard → Authentication → Policies
--   2. Test: logged-in user can CRUD their own books
--   3. Test: logged-in user CANNOT modify another user's books
--   4. Test: anonymous user can READ but not INSERT/UPDATE/DELETE
--   5. Set CREEM_WEBHOOK_SECRET in Vercel env vars (mandatory now)
-- ═══════════════════════════════════════════════════════════════════════════
