import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { bullet } = await request.json();

    if (!bullet || typeof bullet !== 'string') {
      return NextResponse.json(
        { error: 'Invalid bullet point provided' },
        { status: 400 }
      );
    }

    // TODO: Add your Gemini API key to environment variables
    // Set GEMINI_API_KEY in your .env.local file
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a professional resume writer. Rewrite this resume bullet point to be more impactful, using strong action verbs and quantifiable results where possible. Make it concise but powerful. Only return the rewritten bullet point, nothing else.\n\nOriginal bullet: ${bullet}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate rewrite' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rewrittenBullet =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!rewrittenBullet) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ rewritten: rewrittenBullet });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
