import Anthropic from "@anthropic-ai/sdk";
import { getEnv } from "./env";

/**
 * Given the original need text and a list of delivered pledge descriptions,
 * ask Claude to generate updated need text reflecting what's still needed.
 *
 * Falls back to the original text if the API key isn't configured or the call fails.
 */
export async function generateRemainingNeedText(
  originalBody: string,
  deliveredDescriptions: string[]
): Promise<string> {
  const apiKey = getEnv("ANTHROPIC_API_KEY");
  if (!apiKey) {
    console.log("[llm] ANTHROPIC_API_KEY not configured, returning original text");
    return originalBody;
  }

  const client = new Anthropic({ apiKey });

  const deliveredList = deliveredDescriptions
    .map((d, i) => `${i + 1}. ${d}`)
    .join("\n");

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You help manage a running gear donation platform. An organization posted a need for gear, and some pledges have been delivered. Generate updated text describing ONLY what is still needed.

Keep the same tone and format as the original. Do not add any commentary, preamble, or sign-off — just output the updated need text. If you can't determine what's remaining, return the original text unchanged.

ORIGINAL NEED:
${originalBody}

DELIVERED PLEDGES:
${deliveredList}

UPDATED NEED TEXT (what's still needed):`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type === "text" && block.text.trim()) {
      return block.text.trim();
    }

    return originalBody;
  } catch (err) {
    console.error("[llm] Failed to generate remaining need text:", err);
    return originalBody;
  }
}
