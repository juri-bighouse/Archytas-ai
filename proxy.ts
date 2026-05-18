import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in'
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up'

const isPublicRoute = createRouteMatcher([
  `${signInUrl}(.*)`,
  `${signUpUrl}(.*)`,
])

const isApiRoute = createRouteMatcher(['/api/(.*)'])

export const proxy = clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request) || isApiRoute(request)) return
  await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
