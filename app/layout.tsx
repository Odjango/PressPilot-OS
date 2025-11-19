import type { ReactNode } from "react";
import { Inter } from "next/font/google";
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
      <body className={`${inter.className} bg-neutral-50 text-neutral-900`}>
        {children}
      </body>
    </html>
  );
}
