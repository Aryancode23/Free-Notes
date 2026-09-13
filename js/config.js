/**
 * config.js
 * ---------
 * Public, client-safe settings only.
 *
 * SUPABASE_ANON_KEY (the "publishable" key) is DESIGNED to sit in
 * client-side code — it can only do what your Row Level Security (RLS)
 * policies allow, nothing more.
 *
 * NEVER put your service_role / secret key in this file, or in any file
 * that ships to the browser or a public repo. It bypasses every RLS
 * policy — full read/write/delete on your whole project. It belongs only
 * on a server you control (which this static site doesn't have one of).
 */

const SUPABASE_URL = "https://qaoaqrxgmmjknmkbxucu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_N9jA9KUV_GIx7q0g7mWYHg_YQwJfXBS";

// The ONLY email allowed to log in and use admin.html.
// Must exactly match: (1) the email of the user you create in
// Supabase → Authentication → Users, and (2) the email used in the RLS
// policies in supabase-setup.sql.
// Defaulted to the contact email from your footer — change it if that's
// not the address you want to log in with.
const ADMIN_EMAIL = "jb007jojo@gmail.com";
