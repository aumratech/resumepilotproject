import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_COOKIE_NAME = 'resumeai_admin_session'
const PROTECTED_ROUTES = [
  '/dashboard',
  '/landing-page',
  '/plans',
  '/resumes',
  '/payments',
  '/colleges',
  '/degrees',
  '/users',
  '/audit-logs',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isLoginPage = pathname === '/login'
  const isRoot = pathname === '/'

  if (isRoot) {
    const targetUrl = new URL(adminToken ? '/dashboard' : '/login', req.url)
    return NextResponse.redirect(targetUrl)
  }

  if (isProtected && !adminToken) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoginPage && adminToken) {
    const dashboardUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)'],
}
