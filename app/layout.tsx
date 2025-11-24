import type { ReactNode } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";

import HeaderAuthStatus from "@/components/HeaderAuthStatus";

import "./globals.css";

export const metadata = {
  title: "PressPilot MVP",
  description: "PressPilot SaaS playground",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-neutral-50 text-neutral-900 antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-neutral-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="text-base font-semibold tracking-tight text-neutral-900"
              >
                PressPilot OS
              </Link>
              <HeaderAuthStatus />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
