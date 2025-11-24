import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    '[PressPilot] Missing OPENAI_API_KEY. AI routes will fail until it is set.',
  );
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callPressPilotJson(params: {
  system: string;
  user: unknown;
}) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4.1',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: params.system },
      {
        role: 'user',
        content: JSON.stringify(params.user),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('[PressPilot AI] Failed to parse JSON:', err, raw);
    return {};
  }
}


