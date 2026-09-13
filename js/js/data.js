/**
 * data.js
 * -------
 * Replaces the old static notes-data.js. Fetches published chapters
 * straight from the Supabase "chapters" table (public read — see
 * supabase-setup.sql for the RLS policy that allows this for anyone,
 * logged in or not).
 */

/**
 * Icon shown on a subject card. Falls back to a generic book icon for any
 * subject name that isn't in this list, since subjects are no longer a
 * fixed set — they're whatever the admin types when uploading.
 */
const SUBJECT_ICONS = {
  physics: "atom",
  chemistry: "flask-conical",
  math: "sigma",
  maths: "sigma",
  mathematics: "sigma",
  biology: "dna",
  english: "book-open-text",
  history: "landmark",
  geography: "globe",
  economics: "trending-up",
  "computer science": "cpu",
};

function iconForSubject(subject) {
  return SUBJECT_ICONS[subject.trim().toLowerCase()] || "book-open";
}

/**
 * Fetches every chapter, newest first.
 * Returns [] (rather than throwing) on error so the page can still render
 * an empty state instead of breaking.
 */
async function fetchChapters() {
  const { data, error } = await supabaseClient
    .from("chapters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load chapters:", error.message);
    return [];
  }
  return data || [];
}

/**
 * Groups chapters into a subjects summary: one entry per distinct subject,
 * with a chapter count, newest-uploaded-first.
 */
function deriveSubjects(chapters) {
  const bySubject = new Map();

  for (const ch of chapters) {
    if (!bySubject.has(ch.subject)) {
      bySubject.set(ch.subject, { name: ch.subject, chapterCount: 0 });
    }
    bySubject.get(ch.subject).chapterCount += 1;
  }

  return Array.from(bySubject.values());
}
