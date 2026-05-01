/**
 * Utility to handle multitenancy via subdomains or paths.
 */
export function getStoreSlug(): string | null {
  const hostname = window.location.hostname;
  const path = window.location.pathname;

  // 1. Check for subdomain
  // Expected formats: 
  // - storename.anotoapp.vercel.app
  // - storename.anoto.app
  // - localhost (no subdomain)
  
  const parts = hostname.split('.');
  
  // If we are on a custom domain like anoto.app, subdomains start from index 0
  // If we are on vercel.app, we need to be careful.
  // anotoapp.vercel.app -> length 3
  // store.anotoapp.vercel.app -> length 4
  
  if (hostname.includes('vercel.app')) {
    if (parts.length > 3) {
      return parts[0];
    }
  } else if (parts.length > 2) {
    // Standard domain like store.anoto.app
    return parts[0];
  }

  // 2. Fallback to path if no subdomain (for development or legacy links)
  // This helps when accessing anotoapp.vercel.app/storename
  const pathParts = path.split('/').filter(Boolean);
  if (pathParts.length > 0 && !['admin', 'order'].includes(pathParts[0])) {
    return pathParts[0];
  }

  return null;
}

export function isLandingPage(): boolean {
  const slug = getStoreSlug();
  const path = window.location.pathname;
  
  // If no slug found and we are at root, it's landing page
  if (!slug && (path === '/' || path === '')) return true;
  
  // If we are on /admin, it's not landing page
  if (path.startsWith('/admin')) return false;

  return false;
}
