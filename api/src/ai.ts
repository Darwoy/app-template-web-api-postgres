import Anthropic from "@anthropic-ai/sdk";

// AI calls leave through the builder's door guard, never straight to a provider: AI_BASE_URL is the
// guard's model door and AI_TOKEN the session or app token it checks. The guard adds the real key.
// Without AI_BASE_URL (CI, a laptop without a guard) `ask` returns a marked stand-in so tests still run.
const baseURL = process.env.AI_BASE_URL;
const model = process.env.AI_MODEL ?? "claude-opus-4-7";
export const aiAvailable = Boolean(baseURL);

const client = baseURL
  ? new Anthropic({
      baseURL,
      apiKey: "via-doorguard",
      defaultHeaders: { "X-Session-Token": process.env.AI_TOKEN ?? "" },
    })
  : null;

export async function ask(
  prompt: string,
  options: { system?: string; maxTokens?: number } = {},
): Promise<string> {
  if (!client) return `[stand-in answer] ${prompt.slice(0, 200)}`;
  const message = await client.messages.create({
    model,
    max_tokens: options.maxTokens ?? 1024,
    ...(options.system ? { system: options.system } : {}),
    messages: [{ role: "user", content: prompt }],
  });
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}
