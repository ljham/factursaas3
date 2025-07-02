import { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware básico - por ahora solo deja pasar todas las requests
  // Clerk será manejado por los componentes directamente
  return;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};