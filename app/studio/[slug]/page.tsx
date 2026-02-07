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
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = 'force-dynamic';

export default async function StudioPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-4">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          ← Back to Projects
        </Link>
      </div>
      <StudioClient slug={slug} />
    </section>
  );
}


