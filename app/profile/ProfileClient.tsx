"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

type ProfileRecord = {
  id?: string;
  email?: string;
  full_name?: string | null;
  created_at?: string | null;
};

const defaultStatus = {
  type: 'idle',
  message: '',
} as const;

export default function ProfileClient() {
  const [sessionReady, setSessionReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [fullName, setFullName] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [status, setStatus] = useState<
    { type: 'idle' | 'saving' | 'success' | 'error'; message: string }
  >(defaultStatus);

  const loadProfile = useCallback(async (email: string) => {
    setIsLoadingProfile(true);
    setLoadError(null);

    const { data, error } = await supabase
      .from('pp_profiles')
      .select('id,email,full_name,created_at')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('[ProfileClient] loadProfile error:', error);
      setLoadError('Unable to load profile. Please try again.');
      setProfile(null);
      setFullName('');
    } else {
      setProfile(data);
      setFullName(data?.full_name ?? '');
    }

    setIsLoadingProfile(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      const nextUser = data.user ?? null;
      setUser(nextUser);
      setSessionReady(true);

      if (nextUser?.email) {
        loadProfile(nextUser.email.toLowerCase());
      } else {
        setProfile(null);
        setFullName('');
      }
    };

    bootstrap();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser?.email) {
        loadProfile(nextUser.email.toLowerCase());
      } else {
        setProfile(null);
        setFullName('');
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const createdAtLabel = useMemo(() => {
    if (!profile?.created_at) return null;
    const date = new Date(profile.created_at);
    return date.toLocaleString();
  }, [profile?.created_at]);

  if (!sessionReady) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
        Checking Supabase session…
      </div>
    );
  }

  if (!user?.email) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600">
        Please sign in to manage your profile. Supabase auth is required to
        access <code className="font-mono text-xs">pp_profiles</code>.
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
        Loading profile…
      </div>
    );
  }

  const handleRetryLoad = () => {
    if (user?.email) {
      loadProfile(user.email.toLowerCase());
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user.email) return;

    setStatus({ type: 'saving', message: 'Saving profile...' });

    try {
      const { data, error } = await supabase
        .from('pp_profiles')
        .upsert(
          {
            email: user.email.toLowerCase(),
            full_name: fullName.trim(),
          },
          { onConflict: 'email' },
        )
        .select('id,email,full_name,created_at')
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      setStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      console.error('[ProfileClient] updateProfile error:', error);
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred.';
      setStatus({ type: 'error', message });
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} dir="auto">
      {loadError ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-700">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={handleRetryLoad}
            className="rounded-full border border-red-200 bg-white/70 px-3 py-1 text-xs font-semibold text-red-700 transition hover:border-red-400"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="profile-email"
          className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          Email
        </label>
        <input
          id="profile-email"
          readOnly
          value={user.email}
          className="mt-2 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700"
        />
      </div>

      <div>
        <label
          htmlFor="profile-full-name"
          className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          Full Name
        </label>
        <input
          id="profile-full-name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Jane Smith"
          className="mt-2 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:border-black focus:outline-none"
          required
        />
        <p className="mt-2 text-xs text-neutral-500">
          Shown inside generated kits and billing receipts.
        </p>
      </div>

      {createdAtLabel ? (
        <p className="text-xs text-neutral-500">
          Member since <span className="font-medium">{createdAtLabel}</span>
        </p>
      ) : null}

      {status.type !== 'idle' ? (
        <p
          className={`text-sm ${
            status.type === 'error'
              ? 'text-red-600'
              : status.type === 'success'
                ? 'text-emerald-600'
                : 'text-neutral-500'
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status.type === 'saving'}
          className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {status.type === 'saving' ? 'Saving…' : 'Update Profile'}
        </button>
        <p className="text-xs text-neutral-500">
          Updates run through Supabase RLS (
          <code className="font-mono text-[11px]">email = auth.jwt()</code>).
        </p>
      </div>
    </form>
  );
}
