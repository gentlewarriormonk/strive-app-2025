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
      "You suggest specific backup plans that directly address the stated obstacle. Return ONLY a JSON array of exactly 3 strings. No explanation.",
    user: (i) =>
      `The user wants to "${i.habit}". Their obstacle is: "${i.obstacle}".

Suggest 3 specific backup plans that directly solve or work around this exact obstacle. The backup should help them still accomplish the habit or a modified version of it.

Bad example: obstacle is "cat not in the mood" → "meditate" (doesn't help with the cat)
Good example: obstacle is "cat not in the mood" → "try again in 10 minutes" (directly addresses it)

Return a JSON array of 3 backup plans.`,
  },
  "polish-intention": {
    system:
      "You synthesize habit planning inputs into natural, supportive sentences for students. You detect redundancy and consolidate overlapping ideas. You never produce content that could encourage harm, self-harm, unhealthy behaviors, or anything inappropriate for young people. Return ONLY the final statement as a short paragraph.",
    user: (i) =>
      `Create a natural implementation intention from these inputs:

Habit: ${i.habit}
Trigger/Cue: ${i.cue}
Location: ${i.location}
Obstacle: ${i.obstacle}
Backup plan: ${i.backup}

Rules:
1. Start with: "After [trigger], I will [habit] at/in [location]."
2. Then add: "If [obstacle - in natural language], I will [backup]."
3. IMPORTANT: If the backup plan overlaps with or repeats the habit, consolidate them intelligently. Don't repeat the same action twice.
4. Make obstacles conversational: "Forgetting" → "I forget", "Not enough time" → "I'm short on time"
5. Keep the tone positive, supportive, and appropriate for students aged 12-18.
6. Never include content related to harm, self-harm, substances, or anything inappropriate.
7. If inputs seem concerning, reframe positively or produce a gentle, safe alternative.

Return ONLY the implementation intention as 1-2 sentences. No explanation.`,
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
