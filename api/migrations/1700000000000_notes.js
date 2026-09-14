export const up = (pgm) => {
  pgm.createTable("notes", {
    id: "id",
    text: { type: "text", notNull: true },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
};
export const down = (pgm) => { pgm.dropTable("notes"); };
