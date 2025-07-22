/**
 * Normalizes a URL string by ensuring it has a trailing slash and optionally includes search parameters.
 * @param url - The URL string to normalize
 * @param includeSearchString - Whether to include search parameters in the result
 * @returns The normalized URL string
 * @throws Error if the URL is invalid, empty, or not a string
 */
export function normalizeUrl(url: string, includeSearchString?: boolean): string {
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }

  if (!url.trim()) {
    throw new Error('URL cannot be empty');
  }

  try {
    const urlObject = new URL(url);

    return (
      urlObject.origin +
      (urlObject.pathname.endsWith('/') ? urlObject.pathname : urlObject.pathname + '/') +
      (includeSearchString && urlObject.search ? urlObject.search : '')
    );
  } catch {
    throw new Error(`Connection string ${url} is not a valid URL`);
  }
}

/**
 * Merges two URLs, combining their paths and query parameters.
 * If loginUrlStr is an absolute URL, it takes precedence over baseUrlStr.
 * If loginUrlStr is relative, it's merged with baseUrlStr.
 *
 * @param baseUrlStr - The base URL to merge with
 * @param loginUrlStr - The login URL (can be absolute or relative)
 * @returns The merged URL string
 * @throws Error if baseUrlStr is not a valid URL
 */
export function mergeUrlsWithParams(baseUrlStr: string, loginUrlStr?: string): string {
  if (!baseUrlStr) {
    throw new Error('Base URL is required');
  }

  // Parse base URL first to validate it
  let baseUrl: URL;
  try {
    baseUrl = new URL(baseUrlStr);
  } catch {
    throw new Error('Base URL is not valid');
  }

  // If no login URL provided or it's just a slash, return base URL
  if (!loginUrlStr || loginUrlStr === '/') {
    return baseUrl.toString();
  }

  try {
    // Check if loginUrlStr is an absolute URL
    const loginUrl = new URL(loginUrlStr);
    return loginUrl.toString();
  } catch {
    // loginUrlStr is relative, proceed with merging
  }

  // Create a URL by joining base origin with login path
  const resultUrl = new URL(baseUrl.toString());

  // Split login URL into path and query parts
  const [loginPath = '', loginQuery = ''] = loginUrlStr.split(/\?(.+)/);

  // Handle the path merging
  const basePath = baseUrl.pathname.replace(/\/$/, ''); // Remove trailing slash
  const cleanLoginPath = loginPath
    .replace(/^\/+/, '') // Remove leading slashes
    .replace(/\/+$/, '') // Remove trailing slashes
    .replace(/\/+/g, '/'); // Replace multiple slashes with single slash

  resultUrl.pathname = cleanLoginPath ? `${basePath}/${cleanLoginPath}` : basePath;

  // Parse and merge query parameters from both URLs
  if (loginQuery) {
    const loginParams = new URLSearchParams(loginQuery);
    for (const [key, value] of loginParams.entries()) {
      resultUrl.searchParams.set(key, value);
    }
  }

  // Normalize the final URL by removing trailing slash
  return normalizeUrl(resultUrl.toString(), true);
}
