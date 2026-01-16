
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  // Security check: Ensure we are proxying a Google URL if possible, or just trust the internal flow.
  // The URI from Veo usually looks like https://generativelanguage.googleapis.com/...
  // We allow sample videos for testing as well.
  if (!targetUrl.includes('googleapis.com') && !targetUrl.includes('sample-videos.com')) {
     // Optional: Add stricter validation here for production
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new NextResponse('Server Configuration Error', { status: 500 });
  }

  try {
    // Append the API key only if it's a Google API URL
    let fetchUrl = targetUrl;
    if (targetUrl.includes('googleapis.com')) {
        fetchUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}key=${apiKey}`;
    }

    const response = await fetch(fetchUrl);

    if (!response.ok) {
      return new NextResponse(`Upstream Error: ${response.statusText}`, { status: response.status });
    }

    // Stream the response back
    const headers = new Headers(response.headers);
    headers.set('Content-Disposition', 'inline'); // Ensure it plays in browser
    
    // Clean up headers that might cause issues
    headers.delete('content-encoding');

    return new NextResponse(response.body, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error('Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
