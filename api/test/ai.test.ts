import { describe, it, expect } from "vitest";
import { aiAvailable, ask } from "../src/ai.js";

describe("ai helper without a guard", () => {
  it("answers with a marked stand-in so features can be exercised offline", async () => {
    expect(aiAvailable).toBe(false);
    const answer = await ask("Summarise: the meeting is at ten.");
    expect(answer.startsWith("[stand-in answer]")).toBe(true);
  });
});
