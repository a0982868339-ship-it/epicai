
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { story, characters, provider = 'google' } = await req.json();
    
    // Construct the prompt
    const charList = characters.map((c: any) => `${c.name}: ${c.description}`).join("\n");
    const systemPrompt = `You are a professional screenwriter for TikTok/Reels short dramas.
    Characters Available (Use these consistently):
    ${charList}
    
    Task: Write a 45-60s script based on the logline: "${story}".
    Requirements:
    - 4-6 Scenes maximum.
    - JSON Output Only.
    - Fields: 
      - scene_number (int)
      - description (Visual description for AI video generation, include character names and consistent appearance details)
      - dialogue (The spoken lines)
      - character_name (Which character is speaking/on screen)
      - duration (int, seconds)`;

    // --- ONLY OPENAI (GPT-4o) AS REQUESTED ---
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) return NextResponse.json({ error: "OpenAI API Key missing" }, { status: 500 });

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a JSON generator. Output only valid JSON. Ensure character consistency in descriptions." },
            { role: "user", content: systemPrompt }
        ],
        model: "gpt-4o",
        response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(content);
    const scripts = Array.isArray(parsed) ? parsed : (parsed.scenes || parsed.script || []);
    return NextResponse.json(scripts);

  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
  }
}
