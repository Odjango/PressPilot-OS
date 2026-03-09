"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderAuthStatus from "./HeaderAuthStatus";
import { Sparkles, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";

export default function GlobalHeader() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isStudio = pathname?.startsWith("/studio");
    const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/projects");

    return (
        <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group" suppressHydrationWarning>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white group-hover:scale-105 transition-transform">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                PRESSPILOT
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                href="/projects"
                                className={`text-sm font-medium transition-colors hover:text-black ${pathname === "/projects" ? "text-black" : "text-gray-500"}`}
                                suppressHydrationWarning
                            >
                                Projects
                            </Link>
                            <Link
                                href="/pricing"
                                className={`text-sm font-medium transition-colors hover:text-black ${pathname === "/pricing" ? "text-black" : "text-gray-500"}`}
                                suppressHydrationWarning
                            >
                                Pricing
                            </Link>
                            <span
                                className="text-sm font-medium text-gray-300 cursor-default"
                            >
                                Documentation
                            </span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <HeaderAuthStatus />
                        {mounted && !isStudio && !isDashboard && (
                            <Link
                                href="/studio"
                                className="hidden sm:inline-flex items-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                                suppressHydrationWarning
                            >
                                Go to Studio
                            </Link>
                        )}
                        {mounted && isDashboard && (
                            <Link
                                href="/projects"
                                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm font-semibold text-neutral-600 transition hover:border-black hover:text-black"
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
    );
}
