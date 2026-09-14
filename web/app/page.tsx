import { apiBase, listNotes } from "@/lib/api";
import { NoteForm } from "./notes/NoteForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const notes = await listNotes(apiBase());
  return (
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Notes</h1>
      <NoteForm />
      <ul>
        {notes.map((n) => (
          <li key={n.id} data-testid="note">{n.text}</li>
        ))}
      </ul>
    </main>
  );
}
