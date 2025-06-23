// app/api/notes/route.js

import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

// Inisialisasi koneksi ke Redis menggunakan environment variables
// yang secara otomatis disediakan oleh Vercel saat terhubung dengan Upstash.
const redis = Redis.fromEnv();

// GET /api/notes - Mengambil semua catatan
export async function GET() {
  try {
    const noteIds = await redis.keys("note:*");
    if (noteIds.length === 0) {
      return NextResponse.json([]);
    }

    const notesData = await redis.mget(...noteIds);

    // --- BAGIAN YANG DIPERBAIKI ---
    // Kita akan cek tipe data sebelum melakukan parse
    const notes = notesData
      .filter((note) => note !== null) // Saring data yang mungkin null
      .map((note) => {
        // HANYA lakukan parse jika 'note' adalah sebuah string.
        if (typeof note === "string") {
          return JSON.parse(note);
        }
        // Jika sudah menjadi objek, kembalikan langsung.
        return note;
      });
    // --- AKHIR BAGIAN PERBAIKAN ---

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/notes - Membuat catatan baru
export async function POST(request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return new NextResponse("Text is required", { status: 400 });
    }

    const noteId = nanoid();
    const noteKey = `note:${noteId}`;

    const note = {
      id: noteId,
      text: text,
      createdAt: new Date().toISOString(),
    };

    // 4. Sebelum menyimpan, kita harus mengubah objek 'note' menjadi string JSON.
    await redis.set(noteKey, JSON.stringify(note));

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
