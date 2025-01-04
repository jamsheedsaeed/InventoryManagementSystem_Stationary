import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');
  const url = request.nextUrl;

  // Redirect unauthenticated users to login
  if (!token?.value) {
    const loginUrl = new URL('/login', url.origin);
    loginUrl.searchParams.set('callbackUrl', url.pathname); // Redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  // Fetch the session data from the API
  const session = await fetch(`${url.origin}/api/auth/session`, {
    headers: {
      Cookie: `next-auth.session-token=${token.value}`,
    },
  }).then((res) => res.json());

  // Redirect to login if the session is invalid
  if (!session || !session.user) {
    const loginUrl = new URL('/login', url.origin);
    loginUrl.searchParams.set('callbackUrl', url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role; // Assuming 'role' is part of the session object

  // Allow access to /dashboard/sales for all authenticated users
  if (url.pathname === '/dashboard/sales') {
    return NextResponse.next();
  }

  // Protect admin routes
  if (url.pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', url.origin));
  }

  // Redirect 'normal' users to /dashboard/sales when accessing other dashboard routes
  if (url.pathname.startsWith('/dashboard') && role === 'normal' && url.pathname !== '/dashboard/sales') {
    return NextResponse.redirect(new URL('/dashboard/sales', url.origin));
  }

  return NextResponse.next();
}

// Configure the middleware for matching paths
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'], // Apply middleware to these routes
};
