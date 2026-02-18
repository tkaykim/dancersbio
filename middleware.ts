import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const isClientPortal = host.startsWith('client.')
  const { pathname } = request.nextUrl

  // client subdomain: rewrite to /client path (except auth, static, api)
  if (
    isClientPortal &&
    !pathname.startsWith('/client') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/favicon')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/' ? '/client' : `/client${pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
