import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { text, voiceId, provider = 'openai' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // ============ OPENAI TTS (默认引擎) ============
    if (provider === 'openai') {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
      }

      const openai = new OpenAI({ apiKey: openaiKey });

      // OpenAI TTS 支持的声音：alloy, echo, fable, onyx, nova, shimmer
      // 我们映射到用户友好的名称
      const voiceMap: Record<string, string> = {
        'sweet-female-a': 'nova',      // 甜美女声
        'warm-female-b': 'shimmer',    // 温暖女声
        'storyteller': 'fable',        // 故事叙述者
        'deep-male-a': 'onyx',         // 低沉男声
        'neutral-male': 'echo',        // 中性男声
        'energetic-male': 'alloy',     // 活力男声
      };

      const openaiVoice = voiceMap[voiceId] || 'nova';

      const response = await openai.audio.speech.create({
        model: "tts-1-hd", // 高清版本，音质更好
        voice: openaiVoice as any,
        input: text,
        response_format: "mp3",
        speed: 1.0,
      });

      // 转换为 Buffer
      const buffer = Buffer.from(await response.arrayBuffer());
      const base64Audio = buffer.toString('base64');
      const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

      return NextResponse.json({ 
        audioUrl: audioDataUrl,
        provider: 'openai',
        voice: openaiVoice,
        duration: Math.ceil(text.length / 15) // 估算时长（秒）
      });
    }

    // ============ ELEVENLABS TTS (Pro 用户专享) ============
    if (provider === 'elevenlabs') {
      const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenLabsKey) {
        return NextResponse.json({ 
          error: "ElevenLabs API key not configured. Please upgrade to Pro plan.",
          fallbackProvider: 'openai'
        }, { status: 403 });
      }

      // ElevenLabs API 调用
      const voiceIdMap: Record<string, string> = {
        'ultra-female': '21m00Tcm4TlvDq8ikWAM', // Rachel (ElevenLabs 预设)
        'deep-male': 'VR6AewLTigWG4xSOukaG', // Arnold
        'storyteller': 'pNInz6obpgDQGcFmaJgB', // Adam
      };

      const elevenVoiceId = voiceIdMap[voiceId] || voiceId; // 如果是克隆语音，直接用传入的 ID

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': elevenLabsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2", // 支持多语言
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs API error: ${error}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

      return NextResponse.json({ 
        audioUrl: audioDataUrl,
        provider: 'elevenlabs',
        voice: elevenVoiceId,
        duration: Math.ceil(text.length / 15)
      });
    }

    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });

  } catch (error: any) {
    console.error("Audio generation error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to generate audio",
      details: error.toString()
    }, { status: 500 });
  }
}


