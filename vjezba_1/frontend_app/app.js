const API_BASE = "https://rs-vjezbe-backend-et8n.onrender.com/";
const NOTE_COLORS = ["var(--paper-1)", "var(--paper-2)", "var(--paper-3)", "var(--paper-4)", "var(--paper-5)"];

const noteTextEl = document.getElementById("noteText");
const addBtnEl = document.getElementById("addBtn");
const notesGridEl = document.getElementById("notesGrid");
const noteCountEl = document.getElementById("noteCount");
const formHintEl = document.getElementById("formHint");

let notes = [];
renderNotes();
loadNotes();

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
  deleteNote(id);
});

async function addNote() {
  const text = noteTextEl.value.trim();
  if (!text) {
    setHint("Type a note before pinning it.");
    noteTextEl.focus();
    return;
  }

  try {
    addBtnEl.disabled = true;
    const response = await fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("Failed to create note.");
    }

    const created = await response.json();
    notes.unshift(created);
    renderNotes();

    noteTextEl.value = "";
    setHint("Note pinned.");
  } catch {
    setHint("Could not save note. Check API_BASE and backend status.");
  } finally {
    addBtnEl.disabled = false;
  }
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
      const style = getNoteStyle(note.id);
      return `
        <article class="note" style="background:${style.color};--tilt:${style.tilt}">
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

async function loadNotes() {
  try {
    const response = await fetch(`${API_BASE}/notes`);
    if (!response.ok) {
      throw new Error("Failed to load notes.");
    }
    const data = await response.json();
    notes = Array.isArray(data) ? data : [];
    renderNotes();
    setHint("Notes loaded from backend.");
  } catch {
    notes = [];
    renderNotes();
    setHint("Could not load notes. Check API_BASE and backend status.");
  }
}

async function deleteNote(id) {
  try {
    const response = await fetch(`${API_BASE}/notes/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete note.");
    }

    notes = notes.filter((note) => note.id !== id);
    renderNotes();
    setHint("Note removed.");
  } catch {
    setHint("Could not delete note. Check API_BASE and backend status.");
  }
}

function getNoteStyle(id) {
  const safeId = Number.isFinite(Number(id)) ? Number(id) : 1;
  const color = NOTE_COLORS[Math.abs(safeId) % NOTE_COLORS.length];
  const tilt = `${((Math.abs(safeId) % 7) - 3).toString()}deg`;
  return { color, tilt };
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
