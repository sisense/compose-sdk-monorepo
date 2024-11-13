export function normalizeUrl(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}
