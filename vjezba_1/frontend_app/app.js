const STORAGE_KEY = "postit_wall_notes_v1";
const NOTE_COLORS = ["var(--paper-1)", "var(--paper-2)", "var(--paper-3)", "var(--paper-4)", "var(--paper-5)"];

const noteTextEl = document.getElementById("noteText");
const addBtnEl = document.getElementById("addBtn");
const notesGridEl = document.getElementById("notesGrid");
const noteCountEl = document.getElementById("noteCount");
const formHintEl = document.getElementById("formHint");

let notes = loadNotes();
renderNotes();

addBtnEl.addEventListener("click", addNote);
noteTextEl.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    addNote();
  }
});

notesGridEl.addEventListener("click", (event) => {
  const deleteBtn = event.target.closest(".delete-btn");
  if (!deleteBtn) {
    return;
  }

  const id = Number(deleteBtn.dataset.id);
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  renderNotes();
});

function addNote() {
  const text = noteTextEl.value.trim();
  if (!text) {
    setHint("Type a note before pinning it.");
    noteTextEl.focus();
    return;
  }

  const note = {
    id: Date.now(),
    text,
    createdAt: new Date().toISOString(),
    color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
    tilt: `${Math.floor(Math.random() * 7) - 3}deg`,
  };

  notes.unshift(note);
  saveNotes();
  renderNotes();

  noteTextEl.value = "";
  setHint("Note pinned.");
}

function renderNotes() {
  noteCountEl.textContent = `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;

  if (notes.length === 0) {
    notesGridEl.innerHTML = '<div class="empty-state">No notes yet. Add your first one.</div>';
    return;
  }

  notesGridEl.innerHTML = notes
    .map((note) => {
      const dateLabel = new Date(note.createdAt).toLocaleString();
      return `
        <article class="note" style="background:${note.color};--tilt:${note.tilt}">
          <button class="delete-btn" data-id="${note.id}" aria-label="Delete note">x</button>
          <p>${escapeHtml(note.text)}</p>
          <time datetime="${note.createdAt}">${dateLabel}</time>
        </article>
      `;
    })
    .join("");
}

function setHint(message) {
  formHintEl.textContent = message;
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
