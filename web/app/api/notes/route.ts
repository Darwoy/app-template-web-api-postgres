import { NextResponse } from "next/server";
import { apiBase, createNote } from "@/lib/api";

export async function POST(req: Request) {
  const body = (await req.json()) as { text?: string };
  if (!body.text || !body.text.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });
  const note = await createNote(apiBase(), body.text.trim());
  return NextResponse.json(note, { status: 201 });
}
