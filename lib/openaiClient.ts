import OpenAI from 'openai';

let cachedClient: OpenAI | null = null;

/**
 * Stage 04 – shared OpenAI client wiring for PressPilot SaaS.
 * Throws a clear error if the required env vars are missing so we fail fast.
 */
export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to your environment to enable Stage 04 generation.');
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }

  return cachedClient;
}

export function getModel(): string {
  return process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';
}
