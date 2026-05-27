import {
  defineEventHandler,
  setResponseHeader,
  removeResponseHeader,
  getRequestURL,
  getQuery,
  createError,
} from 'h3';

export default defineEventHandler((event) => {
  // 1. Prevent Information Disclosure
  removeResponseHeader(event, 'Server');
  removeResponseHeader(event, 'x-powered-by');

  // 2. Add Security Headers
  setResponseHeader(
    event,
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' blob: https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'; form-action 'self'; worker-src 'self' blob:;",
  );
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff');
  setResponseHeader(event, 'X-Frame-Options', 'DENY');
  setResponseHeader(event, 'X-XSS-Protection', '1; mode=block');
  setResponseHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin');
  setResponseHeader(
    event,
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );
  setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // 3. Mitigate Open Redirect Vulnerabilities
  // Block absolute URLs in common redirect query parameters
  const query = getQuery(event);
  const redirectParams = [
    'to',
    'url',
    'redirect',
    'redirect_to',
    'redirectUrl',
    'next',
    'return',
    'returnUrl',
    'continue',
    'dest',
    'destination',
    'u',
  ];

  for (const param of redirectParams) {
    if (query[param]) {
      const targets = Array.isArray(query[param]) ? query[param] : [query[param]];
      for (const t of targets) {
        if (typeof t === 'string') {
          const target = t.trim();
          // Block absolute URLs (http://, https://, //, and even \/\/ for some parsers)
          if (/^([a-z0-9]+:)?\/\//i.test(target) || target.startsWith('\\\\')) {
            throw createError({
              statusCode: 400,
              statusMessage: 'Bad Request: External redirects are prohibited.',
            });
          }
        }
      }
    }
  }

  // 4. Mitigate SQLi and generic injection probing
  const url = getRequestURL(event);
  const path = url.pathname.toLowerCase();
  const searchParams = url.search.toLowerCase();

  // Generic XSS and injection protection for query strings
  if (
    searchParams.includes('<script') ||
    searchParams.includes('javascript:') ||
    searchParams.includes('onerror=')
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Potential injection detected.',
    });
  }

  if (path.includes('/sessions') || path.includes('/api/users')) {
    const searchParams = url.search.toLowerCase();
    // Simple heuristic to block SQLi payloads like "' OR '1'='1"
    if (searchParams.includes('or') || searchParams.includes('1=')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Invalid request payload.',
      });
    }
  }
});
