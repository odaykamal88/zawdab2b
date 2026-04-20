import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/recommendation(.*)',
  '/admin(.*)',
  '/api/vault(.*)',
  '/api/analytics(.*)',
  '/api/dashboard(.*)',
  '/api/admin(.*)',
  '/api/dsar(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return

  await auth.protect()

  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth()
    const role = (sessionClaims?.metadata as Record<string, unknown> | undefined)?.role
    if (role !== 'superadmin') {
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte?|webp?|png|jpg|jpeg|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
