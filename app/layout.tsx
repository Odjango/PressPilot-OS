import type { ReactNode } from "react";
import Link from "next/link";
// import { Inter, JetBrains_Mono } from "next/font/google"; // Removed to fix build timeout

import HeaderAuthStatus from "@/components/HeaderAuthStatus";
import GlobalHeader from "@/components/GlobalHeader";
import { ThemeProvider } from "@/components/theme-provider";
// import { ModeToggle } from "@/components/ui/mode-toggle";

import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "PressPilot | Intelligent Theme Engine",
  description: "Structure Your Vision.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <body
        className={`font-sans bg-white text-black antialiased selection:bg-black selection:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col bg-white">
            <GlobalHeader />
            <main className="flex-1">{children}</main>
            <Toaster position="top-right" richColors closeButton />
            <footer className="border-t border-black/5 bg-gray-50/50 py-12">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                  <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-black text-white text-[10px] font-bold">PP</div>
                    <span className="text-sm font-bold tracking-tight text-gray-900 uppercase">PressPilot OS</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium text-gray-500">
                    <Link href="/faq" className="hover:text-black">FAQ</Link>
                    <Link href="/docs" className="hover:text-black">Documentation</Link>
                    <Link href="/support" className="hover:text-black">Support</Link>
                    <Link href="/terms" className="hover:text-black">Terms</Link>
                  </div>
                  <p className="text-xs font-mono text-gray-400">
                    v2.0.4-stable
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

