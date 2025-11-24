import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getUserAuthContext } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import ProjectsClient, { type ProjectRecord } from '@/app/projects/ProjectsClient';

export const metadata: Metadata = {
  title: 'PressPilot',
  description: 'PressPilot Studio dashboard',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { user, session } = await getUserAuthContext();

  // TEMPORARILY DISABLED: Auth redirect for debugging
  // If not logged in, redirect to auth
  // if (!user?.email || !session) {
  //   redirect('/auth');
  // }

  // If logged in, show projects page directly
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('pp_projects')
    .select('id,owner_email,name,slug,status,created_at')
    .eq('owner_email', user.email)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('[HomePage] error loading projects', error);
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
