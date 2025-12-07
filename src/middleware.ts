/**
 * T013-T016: Next.js Middleware for Premium Content Protection
 * Feature: Premium Content Protection - Phase 3 (US1)
 *
 * Intercepts requests to blog posts and redirects unauthenticated users to login
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // T014: Match /blog/[slug] route pattern
  // Only protect blog post detail pages, not the listing page
  const isBlogPost = /^\/blog\/[^/]+$/.test(pathname);

  if (!isBlogPost) {
    return NextResponse.next();
  }

  // T013: Check session using NextAuth JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // T015: Redirect unauthenticated users to login
  if (!token) {
    // T016: Add callbackUrl query parameter to preserve original destination
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);

    // Preserve any existing query parameters from the original request
    searchParams.forEach((value, key) => {
      loginUrl.searchParams.set(key, value);
    });

    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

// Configure which routes should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all blog post detail pages
     * - /blog/[slug] (but not /blog itself)
     */
    '/blog/:slug+',
  ],
};
