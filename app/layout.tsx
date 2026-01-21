import type { ReactNode } from "react";
import Link from "next/link";
// import { Inter, JetBrains_Mono } from "next/font/google"; // Removed to fix build timeout

import HeaderAuthStatus from "@/components/HeaderAuthStatus";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";

import "./globals.css";

export const metadata = {
  title: "PressPilot | Intelligent Theme Engine",
  description: "Structure Your Vision.",
};

/* 
// Fonts removed to prevent Google API timeouts during build
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});
*/

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`font-sans bg-cream text-black antialiased selection:bg-black selection:text-cream`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col bg-cream dark:bg-black text-black dark:text-cream transition-colors duration-300">
            <header className="border-b border-black/10 dark:border-white/10 bg-cream/80 dark:bg-black/80 backdrop-blur sticky top-0 z-50 transition-colors duration-300">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
                <Link
                  href="/"
                  className="text-lg font-bold tracking-tighter text-black dark:text-cream uppercase font-sans"
                >
                  PressPilot<span className="text-neutral-400">OS</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-mono text-neutral-500">
                  <Link href="/pricing" className="hover:text-black dark:hover:text-cream transition-colors">Pricing</Link>
                  <Link href="#" className="hover:text-black dark:hover:text-cream transition-colors">Docs</Link>
                  <ModeToggle />
                  <HeaderAuthStatus />
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="py-8 text-center text-xs font-mono text-neutral-400 border-t border-black/5 dark:border-white/5 bg-cream dark:bg-black transition-colors duration-300">
              <p>PRESSPILOT OS v2.0</p>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
