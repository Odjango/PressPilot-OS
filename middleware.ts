import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    // Bypass Supabase/auth for tools routes (e.g. /tools/video-summary) and their APIs
    if (req.nextUrl.pathname.startsWith("/tools") || req.nextUrl.pathname.startsWith("/api/yt")) {
        return NextResponse.next();
    }

    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // If user is signed in and the current path is /auth, redirect to /
    if (session && req.nextUrl.pathname === '/auth') {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // If user is not signed in and the current path is /projects, redirect to /auth
    // Note: /studio is now allowed to proceed so the client can handle auth/fetching
    if (!session && req.nextUrl.pathname.startsWith('/projects')) {
        return NextResponse.redirect(new URL('/auth', req.url));
    }

    return res;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
