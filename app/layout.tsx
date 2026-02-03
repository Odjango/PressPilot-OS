import type { ReactNode } from "react";
// import { Inter, JetBrains_Mono } from "next/font/google"; // Removed to fix build timeout

import AppShell from "@/components/AppShell";
import { ThemeProvider } from "@/components/theme-provider";

import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "PressPilot | Intelligent Theme Engine",
  description: "WordPress FSE Themes — Without Editor Errors.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body
        className={`font-sans bg-slate-950 text-white antialiased selection:bg-white selection:text-slate-950`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AppShell>
            {children}
          </AppShell>
          <Toaster position="top-right" richColors closeButton theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  );
}

