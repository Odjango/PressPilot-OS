import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span className="text-2xl font-semibold">PressPilot</span>
          <div className="flex flex-wrap gap-6 text-lg text-gray-600">
            <Link href="/mvp-demo" className="hover:text-gray-900">
              Studio
            </Link>
            <a
              href="https://github.com/presspilotapp"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-900"
            >
              GitHub
            </a>
          </div>
        </div>
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} PressPilot. All rights reserved.</p>
      </div>
    </footer>
  );
}
