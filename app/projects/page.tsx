import { redirect } from 'next/navigation';

import { getUserAuthContext } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';

import ProjectsClient, { type ProjectRecord } from './ProjectsClient';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const { user } = await getUserAuthContext();

  if (!user?.email) {
    redirect('/auth');
  }

  // Safe to render even without user
  let projects: ProjectRecord[] = [];
  const userEmail = user?.email ?? null;

  if (userEmail) {
    // If logged in, load projects
    console.log('[ProjectsPage] fetching projects for', userEmail);
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('pp_projects')
      .select('id,owner_email,name,slug,status,created_at')
      .eq('owner_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ProjectsPage] error loading projects', error);
    } else {
      console.log('[ProjectsPage] loaded projects count:', data?.length);
      projects = (data ?? []) as ProjectRecord[];
    }
  } else {
    console.log('[ProjectsPage] no user email found, skipping fetch');
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <ProjectsClient
        initialProjects={projects}
        userEmail={userEmail}
      />
    </section>
  );
}
