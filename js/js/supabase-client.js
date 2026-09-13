/**
 * supabase-client.js
 * ------------------
 * One shared Supabase client for every page. Load order matters:
 *   1. Supabase CDN script (defines the global `supabase` object)
 *   2. config.js (defines SUPABASE_URL / SUPABASE_ANON_KEY / ADMIN_EMAIL)
 *   3. this file (creates `supabaseClient`, used everywhere else)
 */
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
