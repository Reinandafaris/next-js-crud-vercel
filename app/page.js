// app/page.js
"use client"; // <-- Tandai sebagai Client Component

import { useState, useEffect } from "react";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [inputText, setInputText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null); // ID catatan yang sedang diedit

  // Fungsi untuk mengambil semua catatan
  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      const data = await response.json();
      // Urutkan catatan dari yang terbaru
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotes(sortedData);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  // Panggil fetchNotes saat komponen pertama kali dirender
  useEffect(() => {
    fetchNotes();
  }, []);

  // Handler untuk submit form (menambah atau mengupdate)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const url = editingNoteId
      ? `/api/notes/${editingNoteId}`
      : "/api/notes";
    const method = editingNoteId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (response.ok) {
        setInputText("");
        setEditingNoteId(null);
        await fetchNotes(); // Muat ulang catatan
      } else {
        console.error("Failed to save note");
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  // Handler untuk menghapus catatan
  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus catatan ini?")) {
      try {
        const response = await fetch(`/api/notes/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          await fetchNotes(); // Muat ulang catatan
        } else {
          console.error("Failed to delete note");
        }
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    }
  };

  // Handler untuk masuk ke mode edit
  const handleEdit = (note) => {
    setInputText(note.text);
    setEditingNoteId(note.id);
    window.scrollTo(0, 0); // Gulir ke atas halaman
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Aplikasi Catatan Sederhana
        </h1>

        {/* Form untuk menambah/mengedit catatan */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis catatan Anda di sini..."
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              {editingNoteId ? "Update Catatan" : "Tambah Catatan"}
            </button>
            {editingNoteId && (
              <button
                type="button"
                onClick={() => {
                  setEditingNoteId(null);
                  setInputText("");
                }}
                className="bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Batal
              </button>
            )}
          </form>
        </div>

        {/* Daftar Catatan */}
        <div className="space-y-4">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-white p-5 rounded-lg shadow-md flex justify-between items-start"
              >
                <p className="text-gray-700 break-all mr-4">
                  {note.text}
                </p>
                <div className="flex-shrink-0 flex gap-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-12">
              Belum ada catatan.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
