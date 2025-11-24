"use client";
import Link from 'next/link';
import { useCallback, useMemo, useState, type FormEvent } from 'react';

import { supabase } from '@/lib/supabase';

export type ProjectRecord = {
  id: string;
  owner_email: string;
  name: string;
  slug: string;
  status: string;
  created_at: string | null;
};

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Ready', value: 'ready' },
  { label: 'Live', value: 'live' },
  { label: 'Archived', value: 'archived' },
];

const slugify = (value: string | null | undefined) =>
  (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

const formatProjectError = (error: unknown) => {
  if (error && typeof error === 'object') {
    const err = error as { code?: string; message?: string; details?: string };
    const details = err.details?.toLowerCase() ?? '';
    if (err.code === '23505' || details.includes('duplicate')) {
      return 'That slug already exists. Please choose a different slug.';
    }
    if (err.message) {
      return err.message;
    }
    if (err.details) {
      return err.details;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unable to save project. Please try again.';
};

type ProjectsClientProps = {
  initialProjects: ProjectRecord[];
  userEmail: string | null;
};

export default function ProjectsClient({
  initialProjects,
  userEmail,
}: ProjectsClientProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects);
  const [listError, setListError] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    status: STATUS_OPTIONS[0]?.value ?? 'draft',
  });
  const [status, setStatus] = useState<
    { type: 'idle' | 'saving' | 'error'; message?: string }
  >({ type: 'idle' });

  const refreshProjects = useCallback(async () => {
    if (!userEmail) {
      setProjects([]);
      setIsLoadingList(false);
      return;
    }

    setIsLoadingList(true);
    setListError(null);

    const { data, error } = await supabase
      .from('pp_projects')
      .select('id,owner_email,name,slug,status,created_at')
      .eq('owner_email', userEmail.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ProjectsClient] loadProjects error:', error);
      setProjects([]);
      setListError('Unable to load projects. Please try again.');
    } else {
      setProjects(data ?? []);
    }

    setIsLoadingList(false);
  }, [userEmail]);

  const totalProjectsLabel = useMemo(
    () => `${projects.length} project${projects.length === 1 ? '' : 's'}`,
    [projects.length],
  );

  const handleFieldChange = (
    field: 'name' | 'slug' | 'status',
    value: string,
  ) => {
    setForm((prev) => {
      if (field === 'name') {
        return { ...prev, name: value, slug: prev.slug || slugify(value) };
      }
      if (field === 'slug') {
        return { ...prev, slug: slugify(value) };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!userEmail) {
      setStatus({ type: 'error', message: 'Please sign in to create projects.' });
      return;
    }

    setStatus({ type: 'saving', message: 'Creating project…' });

    try {
      const { data, error } = await supabase
        .from('pp_projects')
        .insert({
          owner_email: (userEmail ?? '').toLowerCase(),
          name: form.name ?? '',
          slug: (form.slug ?? '').trim() || slugify(form.name),
          status: form.status ?? 'draft',
        })
        .select('id,owner_email,name,slug,status,created_at')
        .single();

      if (error) {
        throw error;
      }

      setProjects((prev) => (data ? [data, ...prev] : prev));
      setForm({
        name: '',
        slug: '',
        status: STATUS_OPTIONS[0]?.value ?? 'draft',
      });
      setStatus({ type: 'idle' });
    } catch (error) {
      console.error('[ProjectsClient] createProject error:', error);
      setStatus({ type: 'error', message: formatProjectError(error) });
    }
  };

  const handleStatusUpdate = async (projectId: string, statusValue: string) => {
    if (!userEmail) {
      setStatus({ type: 'error', message: 'Please sign in to update projects.' });
      return;
    }

    setStatus({ type: 'saving', message: 'Updating project…' });

    try {
      const { data, error } = await supabase
        .from('pp_projects')
        .update({ status: statusValue })
        .eq('id', projectId)
        .eq('owner_email', userEmail.toLowerCase())
        .select('id,owner_email,name,slug,status,created_at')
        .single();

      if (error) {
        throw error;
      }

      setProjects((prev) =>
        prev.map((project) => (project.id === projectId && data ? data : project)),
      );
      setStatus({ type: 'idle' });
    } catch (error) {
      console.error('[ProjectsClient] updateProject error:', error);
      setStatus({ type: 'error', message: formatProjectError(error) });
    }
  };

  const handleRetryLoad = () => {
    refreshProjects();
  };

  const renderStatusBadge = (statusValue: string) => {
    const label =
      STATUS_OPTIONS.find((option) => option.value === statusValue)?.label ??
      statusValue;
    const palette: Record<string, string> = {
      draft: 'bg-amber-100 text-amber-800',
      in_review: 'bg-sky-100 text-sky-800',
      ready: 'bg-indigo-100 text-indigo-800',
      live: 'bg-emerald-100 text-emerald-800',
      archived: 'bg-neutral-200 text-neutral-700',
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${palette[statusValue] ?? 'bg-neutral-100 text-neutral-700'}`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-8" dir="auto">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          PressPilot Studio
        </span>
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">Projects</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Each project represents a WordPress + static export bundle tied to your Supabase identity. Create a project to open the Studio and ship kits instantly.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <section className="rounded-3xl border border-neutral-200 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Active Projects
              </p>
              <h2 className="text-xl font-semibold text-neutral-900">
                {totalProjectsLabel}
              </h2>
            </div>
            {listError ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-red-600">
                <span>{listError}</span>
                <button
                  type="button"
                  onClick={handleRetryLoad}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:border-red-400"
                >
                  Retry
                </button>
              </div>
            ) : null}
          </div>


          <div className="mt-6 space-y-4">
            {isLoadingList ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
                Loading projects…
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
                No projects yet. Create one using the form to the right to generate WordPress kits tied to your email.
              </div>
            ) : (
              <ul className="space-y-4">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-base font-semibold text-neutral-900">
                          {project.name}
                        </p>
                        <p className="text-sm text-neutral-500">
                          slug:{' '}
                          <code className="font-mono text-xs">{project.slug}</code>
                        </p>
                        {project.created_at ? (
                          <p className="text-xs text-neutral-400">
                            Created {new Date(project.created_at).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {renderStatusBadge(project.status)}
                        <select
                          aria-label="Project status"
                          value={project.status}
                          onChange={(event) =>
                            handleStatusUpdate(project.id, event.target.value)
                          }
                          className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 focus:border-black focus:outline-none"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <Link
                          href={`/studio/${project.slug}`}
                          className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-900"
                        >
                          Open Studio
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">New project</h3>
          <p className="mt-1 text-sm text-neutral-500">
          Projects enforce Supabase policy{' '}
          <code className="font-mono text-xs">
            owner_email = auth.jwt()-&gt;&gt; &apos;email&apos;
          </code>
          .
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleCreate}>
            <div>
              <label
                htmlFor="project-name"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Project name
              </label>
              <input
                id="project-name"
                value={form.name}
                onChange={(event) => handleFieldChange('name', event.target.value)}
                placeholder="Pixel Sneaks Studio"
                className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:border-black focus:outline-none"
                required
              />
            </div>

            <div>
              <label
                htmlFor="project-slug"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Slug
              </label>
              <input
                id="project-slug"
                value={form.slug}
                onChange={(event) => handleFieldChange('slug', event.target.value)}
                placeholder="pixel-sneaks-studio"
                className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:border-black focus:outline-none"
                required
              />
            </div>

            <div>
              <label
                htmlFor="project-status"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Status
              </label>
              <select
                id="project-status"
                value={form.status}
                onChange={(event) => handleFieldChange('status', event.target.value)}
                className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:border-black focus:outline-none"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {status.type === 'error' ? (
              <p className="text-sm text-red-600">{status.message}</p>
            ) : null}

            <button
              type="submit"
              disabled={status.type === 'saving'}
              className="inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {status.type === 'saving' ? 'Saving…' : 'Create Project'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
