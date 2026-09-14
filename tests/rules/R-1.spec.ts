import { test, expect } from "@playwright/test";

test("R-1: an empty note is never saved", async ({ page, request }) => {
  const apiUrl = process.env.API_URL ?? "http://localhost:3001";
  const before = (await (await request.get(`${apiUrl}/notes`)).json()).length;
  const res = await page.request.post("/api/notes", { data: { text: "   " } });
  expect(res.status()).toBe(400);
  const after = (await (await request.get(`${apiUrl}/notes`)).json()).length;
  expect(after).toBe(before);
});
