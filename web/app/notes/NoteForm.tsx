"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NoteForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await fetch("/api/notes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) });
        setText("");
        setBusy(false);
        router.refresh();
      }}
    >
      <input name="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="A new note" required />
      <button type="submit" disabled={busy}>Add note</button>
    </form>
  );
}
