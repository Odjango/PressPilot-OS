/**
 * Project data fetching helpers (Server-Only)
 */

import { supabaseAdmin } from './supabase/admin';

export type ProjectRow = {
  id: string;
  slug: string;
  name: string;
  owner_email: string;
  status: string;
  created_at: string | null;
};

export type GetProjectBySlugResult = {
  project: ProjectRow | null;
  error: string | null;
};

/**
 * Fetch a project by slug using admin client (bypasses RLS)
 * This is a pure server helper used for Studio page lookups where we need
 * to find projects without requiring the user's auth session.
 *
 * @param slug - The project slug to look up
 * @returns Object with project data or null, and error information
 */
export async function getProjectBySlug(
  slug: string,
): Promise<GetProjectBySlugResult> {
  if (!slug) {
    console.warn('[getProjectBySlug] Missing slug parameter');
    return { project: null, error: 'Missing slug' };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('pp_projects')
      .select('id, slug, name, owner_email, status, created_at')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('[getProjectBySlug] Supabase error', { slug, error });
      return { project: null, error: error.message };
    }

    if (!data) {
      console.warn('[getProjectBySlug] No project found for slug', { slug });
      return { project: null, error: null };
    }

    return { project: data as ProjectRow, error: null };
  } catch (err) {
    console.error('[getProjectBySlug] Unexpected error (likely missing env vars)', err);
    return { project: null, error: 'Internal system error' };
  }


}

