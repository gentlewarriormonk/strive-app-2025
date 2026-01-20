import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface PromptInputs {
  habit?: string;
  cue?: string;
  location?: string;
  obstacle?: string;
  backup?: string;
}

const prompts: Record<string, { system: string; user: (i: PromptInputs) => string }> = {
  "suggest-habits": {
    system:
      "You suggest specific, actionable habits. If the user's input is already specific (has duration, quantity, or a clear action), suggest minor variations. If vague, suggest concrete alternatives. Return ONLY a JSON array of exactly 3 strings. No explanation.",
    user: (i) =>
      `The user wants to: "${i.habit}". Suggest 3 specific versions. If their version is already specific, suggest small variations (different duration, time, or approach). Always include duration or quantity.`,
  },
  "suggest-cues": {
    system:
      "You suggest specific trigger moments. Return ONLY a JSON array of exactly 3 strings. No explanation.",
    user: (i) =>
      `The user wants to "${i.habit}" after "${i.cue}". Suggest 3 more specific versions of this trigger moment. Example: ["Close my laptop at 5:30pm", "Leave the office", "Get home and change clothes"]`,
  },
  "suggest-obstacles": {
    system:
      "You identify common obstacles. Return ONLY a JSON array of exactly 3 short strings (max 6 words each). No explanation.",
    user: (i) =>
      `What are 3 common obstacles for someone trying to "${i.habit}"?`,
  },
  "suggest-backups": {
    system:
      "You suggest realistic backup plans. Return ONLY a JSON array of exactly 3 short strings (max 8 words each). No explanation.",
    user: (i) =>
      `Someone wants to "${i.habit}" but might face: "${i.obstacle}". Suggest 3 realistic backup plans.`,
  },
  "polish-intention": {
    system:
      "You fix grammar and create natural, logical sentences. If something doesn't make logical sense, fix it. Return ONLY the corrected text, nothing else.",
    user: (i) =>
      `Create a grammatically correct implementation intention.
The habit is: ${i.habit}
The trigger is: after ${i.cue}
The location is: ${i.location}
The obstacle is: ${i.obstacle}
The backup plan is: ${i.backup}

Format as exactly two sentences:
1. "After I [trigger], I will [habit] at [location]."
2. "If [obstacle happens], then I will [backup]."

Make it grammatically correct and logically coherent. Don't include frequency words like "every day" or "every workday" in the first sentence. Return only the two sentences.`,
  },
};

export async function POST(req: Request) {
  try {
    const { task, inputs } = await req.json();

    const prompt = prompts[task];
    if (!prompt) {
      return NextResponse.json({ error: "Invalid task" }, { status: 400 });
    }

    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ fallback: true });
    }

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 150,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user(inputs) }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON for suggestion tasks
    if (task.startsWith("suggest-")) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length === 3) {
          return NextResponse.json({ suggestions: parsed });
        }
      } catch {
        return NextResponse.json({ fallback: true });
      }
    }

    return NextResponse.json({ result: text.trim() });
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json({ fallback: true });
  }
}
