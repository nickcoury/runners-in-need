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

  const deliveredList = deliveredDescriptions
    .map((d, i) => `${i + 1}. ${d}`)
    .join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
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
      }),
    });

    if (!res.ok) {
      console.error("[llm] API returned", res.status, await res.text());
      return originalBody;
    }

    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const block = data.content[0];
    if (block?.type === "text" && block.text.trim()) {
      return block.text.trim();
    }

    return originalBody;
  } catch (err) {
    console.error("[llm] Failed to generate remaining need text:", err);
    return originalBody;
  }
}
