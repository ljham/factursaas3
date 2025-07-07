import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/setup',
  '/api/webhook(.*)'
]);

const isSetupRoute = createRouteMatcher(['/setup']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // Redirect to sign-in if not authenticated
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  // Allow setup route for authenticated users
  if (isSetupRoute(req)) {
    return NextResponse.next();
  }
  
  // Check if user needs to complete setup (you can add setup check logic here)
  // For now, allow all authenticated users to access protected routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes that don't need middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};