import { describe, it, expect, beforeAll, afterAll } from "vitest";
import pg from "pg";
import { buildApp } from "../src/app.js";

const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://app:app@localhost:5433/app";
const pool = new pg.Pool({ connectionString: DATABASE_URL });
const app = buildApp(pool);

beforeAll(async () => { await pool.query("delete from notes"); });
afterAll(async () => { await app.close(); await pool.end(); });

describe("api", () => {
  it("reports health with a database check", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true, db: "ok" });
  });

  it("creates a note and lists it", async () => {
    const created = await app.inject({ method: "POST", url: "/notes", payload: { text: "Call the dentist" } });
    expect(created.statusCode).toBe(201);
    const note = created.json();
    expect(note).toMatchObject({ text: "Call the dentist" });
    expect(typeof note.id).toBe("number");
    expect(typeof note.createdAt).toBe("string");

    const list = await app.inject({ method: "GET", url: "/notes" });
    expect(list.statusCode).toBe(200);
    expect(list.json().map((n: { text: string }) => n.text)).toContain("Call the dentist");
  });

  it("rejects an empty note", async () => {
    const res = await app.inject({ method: "POST", url: "/notes", payload: { text: "" } });
    expect(res.statusCode).toBe(400);
  });
});
