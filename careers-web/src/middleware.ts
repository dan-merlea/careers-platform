import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  
  // Skip middleware for localhost and main domain
  if (host === 'localhost:3002' || host === 'hatchbeacon.com' || host === 'www.hatchbeacon.com') {
    return NextResponse.next();
  }

  // Skip middleware for API routes, static files, and Next.js internals
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Lookup job board by custom domain via public API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/public-api/job-boards/domain/${host}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const jobBoard = await response.json();

      if (jobBoard && jobBoard.slug) {
        // Rewrite to the job board page with the slug
        const url = req.nextUrl.clone();
        
        // If already on a job-board path, don't rewrite
        if (pathname.startsWith('/job-board/')) {
          return NextResponse.next();
        }
        
        // Rewrite root path to job board
        if (pathname === '/' || pathname === '') {
          url.pathname = `/job-board/${jobBoard.slug}`;
        }
        
        // Rewrite job detail pages
        if (pathname.match(/^\/[^/]+$/)) {
          // Single path segment - likely a job ID
          url.pathname = `/job-board/${jobBoard.slug}${pathname}`;
        }

        return NextResponse.rewrite(url);
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  // If no custom domain match or error, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
