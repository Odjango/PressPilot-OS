"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderAuthStatus from "./HeaderAuthStatus";
import { Sparkles, LayoutDashboard } from "lucide-react";
import { useEffect, useState, ReactNode } from "react";

/**
 * AppShell - Unified dark-themed layout wrapper for PressPilot OS
 *
 * Provides consistent header/footer across all pages with:
 * - Dark slate background (bg-slate-950)
 * - White/slate text for contrast
 * - Sticky header with backdrop blur
 * - Minimal footer with version and links
 */
export default function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isStudio = pathname?.startsWith("/studio");
    const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/projects");

    return (
        <div className="flex min-h-screen flex-col bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 group" suppressHydrationWarning>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950 group-hover:scale-105 transition-transform">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-white">
                                    PRESSPILOT
                                </span>
                            </Link>

                            <nav className="hidden md:flex items-center gap-6">
                                <Link
                                    href="/projects"
                                    className={`text-sm font-medium transition-colors hover:text-white ${pathname === "/projects" ? "text-white" : "text-slate-400"}`}
                                    suppressHydrationWarning
                                >
                                    Projects
                                </Link>
                                <Link
                                    href="/pricing"
                                    className={`text-sm font-medium transition-colors hover:text-white ${pathname === "/pricing" ? "text-white" : "text-slate-400"}`}
                                    suppressHydrationWarning
                                >
                                    Pricing
                                </Link>
                                <Link
                                    href="/docs"
                                    className={`text-sm font-medium transition-colors hover:text-white ${pathname?.startsWith("/docs") ? "text-white" : "text-slate-400"}`}
                                    suppressHydrationWarning
                                >
                                    Documentation
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <HeaderAuthStatus />
                            {mounted && !isStudio && !isDashboard && (
                                <Link
                                    href="/studio"
                                    className="hidden sm:inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                                    suppressHydrationWarning
                                >
                                    Go to Studio
                                </Link>
                            )}
                            {mounted && isDashboard && (
                                <Link
                                    href="/projects"
                                    className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:border-white hover:text-white"
                                    suppressHydrationWarning
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Projects
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-slate-900/50 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-all">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-slate-950 text-[10px] font-bold">PP</div>
                            <span className="text-sm font-bold tracking-tight text-white uppercase">PressPilot OS</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium text-slate-500">
                            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
                            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
                            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        </div>
                        <p className="text-xs font-mono text-slate-600">
                            v2.0.4-stable
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
