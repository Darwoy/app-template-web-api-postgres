import Fastify, { type FastifyInstance } from "fastify";
import type pg from "pg";

export type Note = { id: number; text: string; createdAt: string };

export function buildApp(pool: pg.Pool): FastifyInstance {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" });

  app.get("/health", async () => {
    await pool.query("select 1");
    return { ok: true, db: "ok" };
  });

  app.get("/notes", async (): Promise<Note[]> => {
    const { rows } = await pool.query(
      "select id, text, created_at as \"createdAt\" from notes order by id"
    );
    return rows;
  });

  app.post<{ Body: { text?: string } }>("/notes", {
    schema: {
      body: {
        type: "object",
        required: ["text"],
        properties: { text: { type: "string", minLength: 1, maxLength: 2000 } },
      },
    },
  }, async (req, reply) => {
    const { rows } = await pool.query(
      "insert into notes (text) values ($1) returning id, text, created_at as \"createdAt\"",
      [req.body.text]
    );
    reply.code(201);
    return rows[0] as Note;
  });

  return app;
}
