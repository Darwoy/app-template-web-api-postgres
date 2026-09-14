import { describe, it, expect, vi } from "vitest";
import { listNotes, createNote } from "./api";

describe("api client", () => {
  it("lists notes from the API base url", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 1, text: "a", createdAt: "t" }] });
    const notes = await listNotes("http://api:3001", fetchMock as unknown as typeof fetch);
    expect(fetchMock).toHaveBeenCalledWith("http://api:3001/notes", { cache: "no-store" });
    expect(notes).toEqual([{ id: 1, text: "a", createdAt: "t" }]);
  });

  it("creates a note with a JSON body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: 2, text: "b", createdAt: "t" }) });
    const note = await createNote("http://api:3001", "b", fetchMock as unknown as typeof fetch);
    expect(fetchMock).toHaveBeenCalledWith("http://api:3001/notes", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "b" }),
    });
    expect(note.text).toBe("b");
  });

  it("throws when the API answers with an error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({}) });
    await expect(createNote("http://api:3001", "", fetchMock as unknown as typeof fetch)).rejects.toThrow("API 400");
  });
});
