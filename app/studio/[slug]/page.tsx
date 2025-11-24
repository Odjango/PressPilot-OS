import Link from 'next/link';

import { getUserAuthContext } from '@/lib/auth';
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from '@/lib/supabase-server';

import StudioClient from '../StudioClient';

type StudioProject = {
  id: string;
  owner_email: string;
  name: string;
  slug: string;
  status: string;
  created_at: string | null;
};

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function StudioPage({ params }: PageProps) {
  const { user } = await getUserAuthContext();
  const isDev = process.env.NODE_ENV === 'development';

  console.log('[StudioPage] env', process.env.NODE_ENV);
  console.log('[StudioPage] user email', user?.email);
  console.log('[StudioPage] slug', params.slug);

  const supabase = isDev
    ? createServiceSupabaseClient()
    : createServerSupabaseClient();

  const queryClient = supabase as any;

  const { data: project, error } = await queryClient
    .from('pp_projects')
    .select('id,owner_email,name,slug,status,created_at')
    .eq('slug', params.slug)
    .maybeSingle();

  console.log('[StudioPage] project result', {
    id: project?.id,
    slug: project?.slug,
    owner_email: project?.owner_email,
    error,
  });

  if (!project || error) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Project not found or not accessible.
        </div>
      </section>
    );
  }

  if (
    !isDev &&
    user?.email &&
    project.owner_email.toLowerCase() !== user.email.toLowerCase()
  ) {
    return (
      <main className="px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          You don&apos;t have access to this project.
        </div>
      </main>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-4">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm font-semibold text-neutral-500 transition hover:text-neutral-900"
        >
          ← Back to Projects
        </Link>
      </div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          PressPilot Studio
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-neutral-900">
          Build kits for {project.name}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Connect the MVP engine to this authenticated project without touching the /mvp-demo playground.
        </p>
      </div>
      <StudioClient project={project as StudioProject} />
    </section>
  );
}


