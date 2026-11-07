const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

let notes = [];
let nextId = 1;

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/notes", (req, res) => {
  res.json(notes);
});

app.post("/notes", (req, res) => {
  const { text } = req.body || {};

  if (typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({
      error: "Field 'text' is required and must be a non-empty string.",
    });
  }

  const note = {
    id: nextId++,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  notes.unshift(note);
  return res.status(201).json(note);
});

app.delete("/notes/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid note id." });
  }

  const before = notes.length;
  notes = notes.filter((note) => note.id !== id);

  if (notes.length === before) {
    return res.status(404).json({ error: "Note not found." });
  }

  return res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
