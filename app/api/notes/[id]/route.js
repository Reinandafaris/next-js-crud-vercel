// app/api/notes/[id]/route.js

import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

// PUT /api/notes/[id] - Memperbarui catatan (VERSI PERBAIKAN)
export async function PUT(request, { params }) {
  const { id } = params;
  const noteKey = `note:${id}`;

  try {
    const { text } = await request.json();
    if (!text) {
      return new NextResponse("Text is required", { status: 400 });
    }

    const existingNoteString = await redis.get(noteKey);
    if (!existingNoteString) {
      return new NextResponse("Note not found", { status: 404 });
    }

    // --- BAGIAN YANG DIPERBAIKI ---
    let existingNote;
    // HANYA lakukan parse jika datanya adalah sebuah string.
    if (typeof existingNoteString === "string") {
      existingNote = JSON.parse(existingNoteString);
    } else {
      // Jika sudah menjadi objek, gunakan langsung.
      existingNote = existingNoteString;
    }
    // --- AKHIR BAGIAN PERBAIKAN ---

    const updatedNote = {
      ...existingNote,
      text,
      updatedAt: new Date().toISOString(),
    };

    await redis.set(noteKey, JSON.stringify(updatedNote));

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error(`Error updating note ${id}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/notes/[id] - Menghapus catatan (Tidak ada perubahan di sini)
export async function DELETE(request, { params }) {
  const { id } = params;
  const noteKey = `note:${id}`;

  try {
    const result = await redis.del(noteKey);
    if (result === 0) {
      return new NextResponse("Note not found", { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting note ${id}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
