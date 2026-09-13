-- ============================================================================
-- Abhi Notes — Supabase setup
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run.
-- Replace 'jb007jojo@gmail.com' below with your real admin email if
-- different (must match ADMIN_EMAIL in js/config.js exactly).
-- ============================================================================

-- 1. Table: one row per uploaded chapter
create table if not exists chapters (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  chapter text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

alter table chapters enable row level security;

-- Anyone (logged in or not) can read the published chapters — this is
-- what lets index.html show the feed to every visitor.
create policy "Public can read chapters"
  on chapters for select
  to anon, authenticated
  using (true);

-- Only your admin account can add new chapters.
create policy "Only admin can insert chapters"
  on chapters for insert
  to authenticated
  with check (auth.jwt() ->> 'email' = 'jb007jojo@gmail.com');

-- ============================================================================
-- 2. Storage bucket for the uploaded PDFs/images
-- ============================================================================
-- Do this part in the Dashboard UI (Storage → New bucket):
--   Name: chapter-files
--   Public bucket: ON   (so download links work for every visitor)
--
-- Then run the two policies below (SQL Editor):

create policy "Public can read chapter files"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'chapter-files');

create policy "Only admin can upload chapter files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'chapter-files'
    and auth.jwt() ->> 'email' = 'jb007jojo@gmail.com'
  );

-- ============================================================================
-- 3. Create your admin login
-- ============================================================================
-- Do this in the Dashboard, not SQL:
--   Authentication → Users → Add user
--   Email: jb007jojo@gmail.com (must match ADMIN_EMAIL and the policies above)
--   Set a password, and toggle "Auto Confirm User" ON so you can log in
--   immediately without clicking an email confirmation link.
