/** Only allows internal paths as redirect target after login (avoids open redirects) */
export function safeReturnUrl(url: string | undefined | null, fallback = '/activities'): string {
  return url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/login') ? url : fallback;
}
