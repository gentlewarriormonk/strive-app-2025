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
      "You suggest specific, actionable habits. Return ONLY a JSON array of exactly 3 strings. No explanation.",
    user: (i) =>
      `The user wants to: "${i.habit}". Suggest 3 specific versions with duration or quantity. Example: ["Run for 20 minutes", "Run for 30 minutes", "Run 2 miles"]`,
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
      "You fix grammar and create natural sentences. Return ONLY the corrected text, nothing else. No quotes around it.",
    user: (i) =>
      `Fix grammar and make this flow naturally as two sentences:
Sentence 1: After I ${i.cue}, I will ${i.habit} at ${i.location}.
Sentence 2: If ${i.obstacle}, I will ${i.backup}.
Return only the two corrected sentences.`,
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
