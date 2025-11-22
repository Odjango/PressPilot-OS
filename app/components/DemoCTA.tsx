import Link from 'next/link';

export default function DemoCTA() {
  return (
    <section className="rounded-3xl bg-blue-600 p-10 text-white shadow-xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold">Try the PressPilot Studio</h2>
          <p className="text-lg text-white/90">Generate a WordPress kit in real time.</p>
        </div>
        <Link
          href="/mvp-demo"
          className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-lg font-semibold text-blue-700 shadow-md transition-colors hover:bg-blue-50"
        >
          Open Studio
        </Link>
      </div>
    </section>
  );
}
