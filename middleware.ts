import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for auth token in cookies
  const token = request.cookies.get('authToken')?.value;

  // Allow demo mode
  const demoMode = request.cookies.get('demoMode')?.value;

  if (token || demoMode === 'true') {
    return NextResponse.next();
  }

  // No token - redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/dashboard/:path*', '/prospection', '/prospection/:path*', '/coaching', '/coaching/:path*'],
};
