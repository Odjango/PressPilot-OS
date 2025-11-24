import { redirect } from 'next/navigation';

import { getUserAuthContext } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';

import ProjectsClient, { type ProjectRecord } from './ProjectsClient';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const { user } = await getUserAuthContext();

  // TEMPORARILY DISABLED: Auth redirect for debugging
  // if (!user?.email) {
  //   redirect('/auth');
  // }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('pp_projects')
    .select('id,owner_email,name,slug,status,created_at')
    .eq('owner_email', user.email)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[ProjectsPage] error loading projects', error);
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <ProjectsClient
        initialProjects={(data ?? []) as ProjectRecord[]}
        userEmail={user.email}
      />
    </section>
  );
}
