
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, imageUrl, provider = 'kling' } = await req.json();

    const klingApiKey = process.env.KLING_API_KEY;
    if (!klingApiKey) {
        // Return mock for demo purposes if no key
        return NextResponse.json({ 
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            status: 'mocked'
        });
    }

    // --- KLING AI IMPLEMENTATION ---
    // Note: Kling API usually follows this flow:
    // 1. POST /v1/videos/text2video (or image2video) -> returns task_id
    // 2. GET /v1/videos/tasks/{task_id} -> returns video URL when finished
    
    const endpoint = imageUrl ? 'https://api.klingai.com/v1/videos/image2video' : 'https://api.klingai.com/v1/videos/text2video';
    
    const body: any = {
        model: 'kling-v1',
        prompt: prompt,
        negative_prompt: "low quality, blurry, distorted faces",
        cfg_scale: 0.5,
        duration: 5, // Typical short drama clip duration
    };

    if (imageUrl) {
        body.image = imageUrl;
    }

    const taskResp = await fetch(endpoint, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${klingApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const taskData = await taskResp.json();
    
    if (!taskResp.ok) {
        throw new Error(taskData.message || "Failed to create Kling task");
    }

    const taskId = taskData.data?.task_id;

    // In a real production app, we would use a webhook or poll in a background job.
    // For this serverless route, we'll do a limited poll (not recommended for long tasks, but works for fast previews).
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 15; // ~30-45 seconds

    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const statusResp = await fetch(`https://api.klingai.com/v1/videos/tasks/${taskId}`, {
            headers: { 'Authorization': `Bearer ${klingApiKey}` }
        });
        const statusData = await statusResp.json();
        
        if (statusData.data?.status === 'completed') {
            videoUrl = statusData.data?.video?.url;
            break;
        } else if (statusData.data?.status === 'failed') {
            throw new Error("Kling generation failed: " + statusData.data?.message);
        }
        attempts++;
    }

    if (!videoUrl) {
        return NextResponse.json({ 
            taskId,
            status: 'processing',
            message: "Video is taking longer than expected. Please check back later.",
            videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" // Fallback mock
        });
    }

    return NextResponse.json({ videoUrl, taskId, status: 'completed' });

  } catch (error: any) {
    console.error("Video generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate video" }, { status: 500 });
  }
}
