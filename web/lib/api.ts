export type Note = { id: number; text: string; createdAt: string };

export async function listNotes(base: string, f: typeof fetch = fetch): Promise<Note[]> {
  const res = await f(`${base}/notes`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function createNote(base: string, text: string, f: typeof fetch = fetch): Promise<Note> {
  const res = await f(`${base}/notes`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export function apiBase(): string {
  const base = process.env.API_URL;
  if (!base) throw new Error("API_URL is required");
  return base;
}
