import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json(
      { error: 'Failed to list models', details: `Gemini API ${response.status}: ${error}` },
      { status: 500 },
    );
  }

  const data = await response.json();
  const models = Array.isArray(data.models) ? data.models : [];
  const supported = models.filter((model) =>
    Array.isArray(model.supportedGenerationMethods)
      ? model.supportedGenerationMethods.includes('generateContent')
      : false,
  );

  return NextResponse.json({
    total: models.length,
    generateContentModels: supported.map((model) => ({
      name: model.name,
      displayName: model.displayName,
      description: model.description,
      version: model.version,
      inputTokenLimit: model.inputTokenLimit,
      outputTokenLimit: model.outputTokenLimit,
      supportedGenerationMethods: model.supportedGenerationMethods,
    })),
  });
}
