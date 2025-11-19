import { PressPilotSaaSInputV2, VariationId } from '@/types/presspilot';

const FALLBACK_SLUG = 'presspilot-kit';
const SAFE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 80;
const VALID_VARIATION_IDS: VariationId[] = ['variation_a', 'variation_b', 'variation_c'];

export function sanitizeSlug(raw: string): string {
  const normalized = (raw ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH);

  return normalized || FALLBACK_SLUG;
}

export function isSafeSlug(slug: string): boolean {
  if (typeof slug !== 'string') {
    return false;
  }

  const trimmed = slug.trim();
  if (!trimmed || trimmed.length > MAX_SLUG_LENGTH) {
    return false;
  }

  return SAFE_SLUG_REGEX.test(trimmed);
}

export function validateSaaSInput(payload: unknown): PressPilotSaaSInputV2 {
  if (!payload || typeof payload !== 'object') {
    throw new Error('INVALID_PAYLOAD');
  }

  const candidate = payload as PressPilotSaaSInputV2;
  if (!candidate.brand?.business_name?.trim()) {
    throw new Error('INVALID_BUSINESS_NAME');
  }

  if (!candidate.narrative?.description_long?.trim()) {
    throw new Error('INVALID_DESCRIPTION');
  }

  if (!candidate.language?.primary_language?.trim()) {
    throw new Error('INVALID_PRIMARY_LANGUAGE');
  }

  if (!candidate.brand?.business_category) {
    throw new Error('INVALID_BUSINESS_CATEGORY');
  }

  return candidate;
}

export function validateSelectedVariationId(id: unknown): VariationId {
  if (typeof id !== 'string') {
    throw new Error('INVALID_SELECTED_VARIATION_ID');
  }

  const trimmed = id.trim() as VariationId;
  if (VALID_VARIATION_IDS.includes(trimmed)) {
    return trimmed;
  }

  throw new Error('INVALID_SELECTED_VARIATION_ID');
}
