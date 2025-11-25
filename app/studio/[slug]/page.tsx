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

export const dynamic = 'force-dynamic';

export default function StudioPage({ params }: PageProps) {
  const slug = params.slug;

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
      <StudioClient slug={slug} />
    </section>
  );
}


