
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // --- ONLY OPENAI (DALL-E 3) AS REQUESTED ---
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
        // Fallback for development if no key
        return NextResponse.json({ imageUrl: `https://picsum.photos/1024/1024?random=${Math.random()}` });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Full body cinematic character portrait, highly detailed, professional lighting, neutral background for consistency. Character details: ${prompt}`,
        n: 1,
        size: "1024x1024",
        response_format: "url"
    });

    return NextResponse.json({ imageUrl: response.data[0].url });

  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
