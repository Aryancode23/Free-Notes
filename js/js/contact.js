/**
 * contact.js
 * ----------
 * Local-only confirmation for the footer contact form. In production, swap
 * the fetch() call below in for a real endpoint (e.g. a serverless function
 * that forwards to email, or a service like Formspree/EmailJS) — the form
 * markup and success-state swap don't need to change.
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-contact-form]");
  const success = document.querySelector("[data-contact-success]");
  if (!form || !success) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.style.display = "none";
    success.hidden = false;
  });
});
