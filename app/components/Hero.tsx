import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-white rounded-2xl shadow-xl p-10 space-y-8">
      <div className="space-y-6">
        <h1 className="text-5xl font-bold leading-tight">
          Build a WordPress site from one simple form.
        </h1>
        <p className="text-lg text-gray-600">
          PressPilot turns your business description into a complete WordPress kit — theme, patterns, and static site exports.
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href="/mvp-demo"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md transition-colors hover:bg-blue-500"
        >
          Open Studio
        </Link>
        <a
          href="#how-it-works"
          className="text-lg font-semibold text-gray-900 underline underline-offset-4"
        >
          See how it works
        </a>
      </div>
    </section>
  );
}
