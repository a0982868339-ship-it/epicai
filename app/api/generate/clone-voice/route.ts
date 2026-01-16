import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, audioFileBase64 } = await req.json();

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      return NextResponse.json({ 
        error: "ElevenLabs API key required for voice cloning. This is a Pro feature.",
      }, { status: 403 });
    }

    if (!audioFileBase64 || !name) {
      return NextResponse.json({ error: "Name and audio file required" }, { status: 400 });
    }

    // 解码 base64 音频文件
    const audioBuffer = Buffer.from(audioFileBase64.split(',')[1] || audioFileBase64, 'base64');

    // 创建 FormData
    const formData = new FormData();
    formData.append('name', name);
    
    // 将 Buffer 转换为 Blob
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    formData.append('files', audioBlob, 'sample.mp3');

    // 调用 ElevenLabs Voice Cloning API
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsKey,
        // Note: 不要设置 Content-Type，让浏览器自动设置为 multipart/form-data
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs cloning failed: ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json({ 
      voiceId: data.voice_id,
      name: name,
      provider: 'elevenlabs',
      isCustom: true,
      message: 'Voice cloned successfully!'
    });

  } catch (error: any) {
    console.error("Voice cloning error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to clone voice",
      details: error.toString()
    }, { status: 500 });
  }
}


