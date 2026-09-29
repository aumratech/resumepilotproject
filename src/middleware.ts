import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify']
const PROTECTED_PREFIXES = ['/dashboard', '/profile', '/chat', '/resumes', '/templates', '/settings', '/saved-jds', '/pricing', '/premium']

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session
  const pathname = nextUrl.pathname

  const isApiAuthRoute = pathname.startsWith('/api/auth')
  const isAuthRoute = AUTH_ROUTES.includes(pathname)
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isApiAuthRoute) return NextResponse.next()

  if (isAuthRoute) {
    if (isLoggedIn && pathname !== '/verify') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)'],
}
