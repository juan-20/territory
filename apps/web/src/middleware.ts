import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // Only protect /territories routes
  if (!request.nextUrl.pathname.startsWith('/territories')) {
    return NextResponse.next()
  }

  // Allow /auth route
  if (request.nextUrl.pathname === '/auth') {
    return NextResponse.next()
  }

  const token = request.cookies.get('territory-token')
 
  // Redirect to /auth if there's no token
  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
 
  return NextResponse.next()
}

export const config = {
  // Only run middleware on the /territories routes
  matcher: ['/territories/:path*']
}
