import ProfileClient from './ProfileClient';
export default function ProfilePage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-neutral-900">Profile</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Manage your PressPilot identity and keep your account details current.
        </p>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white/90 p-8 shadow-sm">
        <ProfileClient />
      </div>
    </section>
  );
}
