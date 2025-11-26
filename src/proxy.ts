// In Next.js 16, proxy.ts replaces middleware.ts for all environments.
import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';

import { routing } from './i18n/routing';

export default function middleware(req: NextRequest) {
  return createMiddleware(routing)(req);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
