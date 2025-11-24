"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

export default function HeaderAuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const resolveUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      setUser(data.user ?? null);
      setLoading(false);
    };

    resolveUser();

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  if (loading) {
    return <span className="text-sm text-neutral-500">Loading…</span>;
  }

  if (!user) {
    if (pathname === "/auth") {
      return null;
    }

    return (
      <Link
        href="/auth"
        className="inline-flex items-center rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 hover:text-black"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-700">
      <span className="hidden sm:inline">
        Signed in as <span className="font-semibold">{user.email}</span>
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        className="inline-flex items-center rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 hover:text-black"
      >
        Sign out
      </button>
    </div>
  );
}


