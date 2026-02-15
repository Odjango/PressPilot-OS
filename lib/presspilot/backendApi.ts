import { NextResponse } from 'next/server';

function normalizeBaseUrl(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, '');
}

export function getBackendBaseUrl(): string | null {
  return normalizeBaseUrl(process.env.BACKEND_URL);
}

export function isBackendProxyEnabled(): boolean {
  return !!getBackendBaseUrl();
}

export function backendApiUrl(pathWithQuery: string): string | null {
  const base = getBackendBaseUrl();
  if (!base) return null;
  const normalizedPath = pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`;
  return `${base}/api${normalizedPath}`;
}

function forwardAuthHeaders(request: Request): HeadersInit {
  const headers: Record<string, string> = {};
  const auth = request.headers.get('authorization');
  if (auth) headers.authorization = auth;
  const cookie = request.headers.get('cookie');
  if (cookie) headers.cookie = cookie;
  return headers;
}

export async function proxyJsonToBackend(
  request: Request,
  pathWithQuery: string,
  method: 'GET' | 'POST',
  body?: unknown
): Promise<NextResponse | null> {
  const url = backendApiUrl(pathWithQuery);
  if (!url) return null;

  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      ...forwardAuthHeaders(request),
    },
    body: method === 'POST' ? JSON.stringify(body ?? {}) : undefined,
  });

  const text = await response.text();
  const contentType = response.headers.get('content-type') || 'application/json';

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'content-type': contentType,
    },
  });
}
