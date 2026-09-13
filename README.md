# Abhi Notes

Free, chapter-wise study notes — plain **HTML, CSS, and JavaScript**, backed
by **Supabase** (Auth + Postgres + Storage). No build step, no framework.

## Project structure

```
index.html            Public home page — hero, subjects, notes feed, footer
login.html              Admin sign-in page
admin.html              Admin dashboard (upload form) — locked to your email
supabase-setup.sql      SQL to run once in Supabase (table, RLS, storage policies)
css/style.css           All styles, including auth-page and empty-state styles
js/config.js            Public Supabase URL/key + your admin email (edit this)
js/supabase-client.js   Shared Supabase client, used by every page
js/auth-guard.js         Locks admin.html to ADMIN_EMAIL, redirects everyone else
js/data.js              fetchChapters() + deriveSubjects() — reads the live data
js/main.js              Renders the home page from live data + all animations
js/admin.js              Upload form: Storage upload + insert into `chapters`
js/contact.js            Footer contact form (local success message only)
```

## One-time setup (do this before anything works)

### 1. Run the SQL script
Supabase Dashboard → your project → **SQL Editor** → paste the contents of
`supabase-setup.sql` → **Run**. This creates the `chapters` table and its
security rules.

### 2. Create the storage bucket
**Storage** → **New bucket** → name it exactly `chapter-files` → toggle
**Public bucket** ON → Create. (The two storage policies for it are in the
same SQL script, in a second block — run that block too, after the bucket
exists.)

### 3. Create your admin login
**Authentication** → **Users** → **Add user**:
- Email: whatever you want to sign in with (this becomes `ADMIN_EMAIL`)
- Set a password
- Toggle **Auto Confirm User** ON, so you can log in immediately

### 4. Set your admin email in the code
Open `js/config.js` and make sure `ADMIN_EMAIL` exactly matches the email
from step 3. It currently defaults to `jb007jojo@gmail.com` — if that's not
the login you created, change it here **and** in the two `auth.jwt() ->>
'email' = '...'` lines inside `supabase-setup.sql` (re-run those two policy
statements after editing).

## Run it locally

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Go to `/admin.html` — you'll be redirected to `/login.html` until you sign
in with the account from step 3.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repo.
2. **Settings → Pages** → Source: "Deploy from a branch" → pick your branch
   and root folder.
3. Your site is live at `https://<username>.github.io/<repo-name>/`.

No build step needed — everything here is static files plus calls to your
Supabase project's public API.

## How publishing a chapter works end-to-end

1. You sign in at `login.html` with the account from setup step 3.
2. `admin.html` checks your session (`js/auth-guard.js`) — anyone who isn't
   `ADMIN_EMAIL` is bounced back to the login page. Subject and chapter name
   are free text, so you're not limited to any fixed list.
3. On submit, `js/admin.js` uploads the file to the `chapter-files` Storage
   bucket, then inserts one row (`subject`, `chapter`, `file_url`) into the
   `chapters` table.
4. `index.html` calls `fetchChapters()` (`js/data.js`) on every page load,
   which reads that same table — newest first — and `js/main.js` renders it
   into both the subjects grid and the notes timeline. A brand-new subject
   just shows up; there's nothing to configure.

## Security notes

- **The security boundary is server-side**, not the "Sign out" button or the
  redirect in `auth-guard.js`. It's the two `insert` policies in
  `supabase-setup.sql` — Supabase itself rejects any upload or table insert
  that isn't from `ADMIN_EMAIL`, no matter what a visitor's browser does.
- `js/config.js` only ever contains the **publishable/anon** key. That key
  is meant to be public — it can't do anything your RLS policies don't
  allow.
- **Never** put your `service_role` / secret key in any file here or in the
  GitHub repo. It bypasses RLS entirely. If it's ever been pasted somewhere
  outside your own machine (a chat, a doc, a support ticket), rotate it from
  **Project Settings → API**.

## Where each requested visual effect lives

- **Kinetic typography** — `js/main.js` (`splitHeadlineIntoLetters`) + the
  `letterIn`/`blurIn` keyframes in `style.css`.
- **Floating animated background** — `.blob-cyan` / `.blob-violet` keyframes.
- **Button glow + scale on hover** — `.btn` classes.
- **3D tilt + border-glow on notes cards** — `initNoteCardTilt()` in
  `main.js`, using CSS custom properties for the pointer-following sheen.
- **Scroll-triggered fade/slide** — `.reveal` / `.in-view`, toggled by an
  `IntersectionObserver` in `main.js`.
- **"New" badge** — `.new-badge`, applied to `chapters[0]` (newest by
  `created_at`).
- **Glassmorphism footer/panels** — `.glass-panel` utility class.
