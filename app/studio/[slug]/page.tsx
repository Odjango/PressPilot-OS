import Link from 'next/link';

import { getProjectBySlug } from '@/lib/projects';

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
  const slug = params.slug;

  console.log('[StudioPage] env', process.env.NODE_ENV);
  console.log('[StudioPage] slug', slug);

  const { project, error } = await getProjectBySlug(slug);

  console.log('[StudioPage] getProjectBySlug result', {
    hasProject: !!project,
    error,
  });

  if (!project) {
    // Log for debugging (server-side only, not visible in UI)
    console.error('[StudioPage] Project not found or error occurred', {
      slug,
      error,
    });

    return (
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Project not found or not accessible.
        </div>
      </section>
    );
  }

  const studioProject: StudioProject = {
    id: project.id,
    owner_email: project.owner_email,
    name: project.name,
    slug: project.slug,
    status: project.status,
    created_at: project.created_at ?? null,
  };

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
          Build kits for {studioProject.name}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Connect the MVP engine to this authenticated project without touching the /mvp-demo playground.
        </p>
      </div>
      <StudioClient project={studioProject} />
    </section>
  );
}


