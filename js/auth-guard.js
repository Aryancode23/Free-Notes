/**
 * auth-guard.js
 * -------------
 * Runs on admin.html only. Client-side redirect is a UX convenience, not
 * the real security boundary — the actual protection is the RLS policies
 * in supabase-setup.sql, which reject any insert/upload that isn't from
 * ADMIN_EMAIL regardless of what the browser does. This script just keeps
 * anyone else from seeing the form at all.
 *
 * admin.html starts with the page content hidden (see the `auth-pending`
 * class in style.css) so there's no flash of the form before this check
 * completes.
 */
(async function guardAdminPage() {
  const { data, error } = await supabaseClient.auth.getSession();
  const session = data?.session;

  if (error || !session || session.user.email !== ADMIN_EMAIL) {
    window.location.replace("login.html");
    return;
  }

  document.documentElement.classList.remove("auth-pending");

  const emailLabel = document.querySelector("[data-admin-email]");
  if (emailLabel) emailLabel.textContent = session.user.email;

  const signOutBtn = document.querySelector("[data-sign-out]");
  signOutBtn?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.replace("login.html");
  });
})();

// Also react to sign-out happening in another tab
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT" || !session || session.user.email !== ADMIN_EMAIL) {
    window.location.replace("login.html");
  }
});
