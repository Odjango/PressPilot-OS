import { redirect } from "next/navigation";

import { getUserAuthContext } from "@/lib/auth";

import AuthClient from "./AuthClient";

export const dynamic = 'force-dynamic';

export default async function AuthPage() {
  const { user, session } = await getUserAuthContext();

  // If already logged in with a valid session, redirect to home
  // This prevents authenticated users from seeing the login form
  if (user?.email && session) {
    redirect("/");
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900">Account</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Use your Supabase email + password to access PressPilot projects.
        </p>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm">
        <AuthClient />
      </div>
    </section>
  );
}
