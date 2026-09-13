/**
 * main.js — Abhi Notes home page
 * ------------------------------
 * Vanilla JS, no framework/build step. Handles:
 *   1. Kinetic headline (letters split + staggered via inline animation-delay)
 *   2. Mobile nav toggle
 *   3. Fetching chapters from Supabase and rendering subjects + the notes
 *      timeline from them (see js/data.js)
 *   4. Scroll-triggered reveal (IntersectionObserver)
 *   5. 3D tilt + pointer-sheen on note cards
 */

document.addEventListener("DOMContentLoaded", async () => {
  initLucideIcons();
  splitHeadlineIntoLetters();
  initMobileNav();

  const chapters = await fetchChapters();
  renderSubjects(deriveSubjects(chapters));
  renderNotesTimeline(chapters);

  initScrollReveal();
  // Tilt is wired up after notes render, since cards don't exist before that.
  initNoteCardTilt();
});

/* ---- 1. Icons ------------------------------------------------------- */
function initLucideIcons() {
  if (window.lucide) window.lucide.createIcons();
}

/* ---- 2. Kinetic headline --------------------------------------------- */
function splitHeadlineIntoLetters() {
  const el = document.querySelector("[data-kinetic-headline]");
  if (!el) return;
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  el.textContent = "";

  text.split("").forEach((char, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.setAttribute("aria-hidden", "true");
    span.style.animationDelay = `${0.2 + i * 0.045}s`;
    if (char === " ") {
      span.style.width = "0.4em";
      span.innerHTML = "&nbsp;";
    } else {
      span.classList.add("text-gradient");
      span.textContent = char;
    }
    el.appendChild(span);
  });
}

/* ---- 3. Mobile nav ---------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.innerHTML = isOpen
      ? '<i data-lucide="x"></i>'
      : '<i data-lucide="menu"></i>';
    initLucideIcons();
  });

  menu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = '<i data-lucide="menu"></i>';
      initLucideIcons();
    })
  );
}

/* ---- 4. Render subjects grid (from live Supabase data) ------------------ */
function renderSubjects(subjects) {
  const grid = document.querySelector("[data-subjects-grid]");
  if (!grid) return;

  if (!subjects.length) {
    grid.innerHTML = `
      <p class="empty-state reveal">
        No subjects yet — they'll appear here as soon as the first chapter
        is uploaded.
      </p>`;
    return;
  }

  grid.innerHTML = subjects
    .map(
      (s, i) => `
    <a href="#notes" class="subject-card reveal" style="transition-delay:${i * 0.08}s">
      <div class="subject-card-top">
        <span class="subject-icon"><i data-lucide="${iconForSubject(s.name)}"></i></span>
        <i data-lucide="arrow-up-right"></i>
      </div>
      <h3>${s.name}</h3>
      <p class="chapter-count">${s.chapterCount} chapter${s.chapterCount === 1 ? "" : "s"} available</p>
    </a>
  `
    )
    .join("");

  initLucideIcons();
}

/* ---- 5. Render notes timeline (from live Supabase data) ----------------- */
function renderNotesTimeline(chapters) {
  const list = document.querySelector("[data-notes-list]");
  if (!list) return;

  if (!chapters.length) {
    list.innerHTML = `
      <li class="empty-state reveal">
        No notes yet. Your first upload will show up here.
      </li>`;
    return;
  }

  list.innerHTML = chapters
    .map((note, i) => {
      const isNewest = i === 0;
      const formattedDate = new Date(note.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return `
      <li class="timeline-item reveal ${isNewest ? "is-newest" : ""}" style="transition-delay:${i * 0.06}s">
        <span class="timeline-node"></span>
        <div class="note-card" data-tilt>
          ${isNewest ? '<span class="new-badge"><i data-lucide="sparkles"></i>New</span>' : ""}
          <span class="note-subject">${note.subject}</span>
          <h3 class="note-chapter">${note.chapter}</h3>
          <span class="note-date">Uploaded ${formattedDate}</span>
          <a href="${note.file_url}" download target="_blank" rel="noopener" class="note-download">
            <i data-lucide="download"></i> Download
          </a>
        </div>
      </li>
    `;
    })
    .join("");

  initLucideIcons();
}

/* ---- 6. Scroll-triggered reveal ---------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  targets.forEach((t) => observer.observe(t));
}

/* ---- 7. 3D tilt + pointer sheen on note cards --------------------------- */
function initNoteCardTilt() {
  const cards = document.querySelectorAll("[data-tilt]");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0 -> 1
      const py = (e.clientY - rect.top) / rect.height; // 0 -> 1

      const rotateY = (px - 0.5) * 16; // left/right tilt
      const rotateX = (0.5 - py) * 16; // up/down tilt

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.setProperty("--sheen-x", `${px * 100}%`);
      card.style.setProperty("--sheen-y", `${py * 100}%`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
    });
  });
}
