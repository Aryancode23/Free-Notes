/**
 * admin.js
 * ========
 * Handles the "Upload a new chapter" form on admin.html.
 *
 * On submit:
 *   1. Uploads the selected file to the Supabase Storage bucket
 *      "chapter-files".
 *   2. Reads back its public URL.
 *   3. Inserts a row into the "chapters" table with subject, chapter,
 *      and file_url.
 *
 * This only succeeds for the signed-in admin — see supabase-setup.sql for
 * the Row Level Security policies that enforce that server-side (the real
 * security boundary; auth-guard.js is just a UX convenience on top of it).
 *
 * index.html reads from the same "chapters" table (js/data.js), so a
 * successful publish here shows up on the live site on next page load /
 * refetch — no other code needs to change.
 */

document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) window.lucide.createIcons();

  const form = document.querySelector("[data-admin-form]");
  const fileInput = document.querySelector("[data-file-input]");
  const fileLabel = document.querySelector("[data-file-label]");
  const submitBtn = document.querySelector("[data-admin-submit]");
  const errorEl = document.querySelector("[data-admin-error]");
  const subjectSuggestions = document.querySelector("[data-subject-suggestions]");

  if (!form) return;

  // Populate the subject <datalist> with subjects already in use, so the
  // admin can reuse an existing one instead of retyping it each time.
  populateSubjectSuggestions();

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    fileLabel.textContent = file ? file.name : "Choose a file to upload";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = fileInput.files?.[0];
    if (!file) return;

    const subject = document.getElementById("subject").value.trim();
    const chapter = document.getElementById("chapter").value.trim();

    errorEl.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Publishing…";

    try {
      // 1. Upload the file to Storage under a collision-proof path
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("chapter-files")
        .upload(path, file);

      if (uploadError) throw uploadError;

      // 2. Read back its public URL
      const { data: urlData } = supabaseClient.storage
        .from("chapter-files")
        .getPublicUrl(path);

      // 3. Insert the chapter row
      const { error: insertError } = await supabaseClient
        .from("chapters")
        .insert({ subject, chapter, file_url: urlData.publicUrl });

      if (insertError) throw insertError;

      submitBtn.innerHTML = '<i data-lucide="check-circle-2"></i> Published';
      if (window.lucide) window.lucide.createIcons();

      setTimeout(() => {
        form.reset();
        fileLabel.textContent = "Choose a file to upload";
        submitBtn.disabled = false;
        submitBtn.textContent = "Publish chapter";
        populateSubjectSuggestions();
      }, 1600);
    } catch (err) {
      console.error(err);
      errorEl.textContent = err.message || "Something went wrong. Please try again.";
      errorEl.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "Publish chapter";
    }
  });

  async function populateSubjectSuggestions() {
    if (!subjectSuggestions) return;
    const { data, error } = await supabaseClient
      .from("chapters")
      .select("subject");
    if (error || !data) return;

    const unique = [...new Set(data.map((row) => row.subject))];
    subjectSuggestions.innerHTML = unique
      .map((s) => `<option value="${s}"></option>`)
      .join("");
  }
});
