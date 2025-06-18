export function normalizeUrl(url: string, includeSearchString?: boolean): string {
  if (!url || typeof url !== 'string') return url;
  const urlObject = new URL(url);

  return (
    urlObject.origin +
    (urlObject.pathname.endsWith('/') ? urlObject.pathname : urlObject.pathname + '/') +
    (includeSearchString && urlObject.search ? urlObject.search : '')
  );
}
