"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function AuthClient() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState<{
    type: "idle" | "loading";
    message: string;
  }>({ type: "idle", message: "" });
  const [error, setError] = useState<string | null>(null);

  const isDisabled =
    status.type === "loading" || !form.email || !form.password;

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Signing in…" });
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        throw signInError;
      }

      router.replace("/projects");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to complete sign in.";
      setError(message);
      setStatus({ type: "idle", message: "" });
    }
  };

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Creating account…" });
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) {
        throw signUpError;
      }

      router.replace("/projects");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to complete sign up.";
      setError(message);
      setStatus({ type: "idle", message: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="auth-email"
          className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          Email
        </label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
          placeholder="you@example.com"
          className="mt-2 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:border-black focus:outline-none"
          required
        />
      </div>

      <div>
        <label
          htmlFor="auth-password"
          className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          Password
        </label>
        <input
          id="auth-password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
          placeholder="••••••••"
          className="mt-2 w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:border-black focus:outline-none"
          required
        />
        <p className="mt-2 text-xs text-neutral-500">
          Use the same credentials configured in Supabase.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {status.type === "loading" ? (
        <p className="text-sm text-neutral-500">{status.message}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isDisabled}
          onClick={handleSignUp}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
        >
          {status.type === "loading" ? "Working…" : "Sign up"}
        </button>
        <button
          type="button"
          disabled={isDisabled}
          onClick={handleSignIn}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {status.type === "loading" ? "Working…" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
