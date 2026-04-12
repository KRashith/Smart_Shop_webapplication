// frontend/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/cart', '/checkout', '/orders', '/admin']
const adminRoutes = ['/admin']

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Ensure you have this export so Next.js recognizes it
export default proxy;

export const config = {
  matcher: ['/cart/:path*', '/checkout/:path*', '/orders/:path*', '/admin/:path*'],
}