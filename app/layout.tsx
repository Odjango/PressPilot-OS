import type { ReactNode } from "react";
import Link from "next/link";
// import { Inter, JetBrains_Mono } from "next/font/google"; // Removed to fix build timeout

import HeaderAuthStatus from "@/components/HeaderAuthStatus";
import { ThemeProvider } from "@/components/theme-provider";
// import { ModeToggle } from "@/components/ui/mode-toggle";

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
    <html lang="en" className="light" style={{ colorScheme: 'light' }} suppressHydrationWarning>
      <body
        className={`font-sans bg-white text-black antialiased selection:bg-black selection:text-cream`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col bg-white text-black transition-colors duration-300">
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
