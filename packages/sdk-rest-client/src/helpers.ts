export const appendHeaders = (
  existingHeaders: HeadersInit,
  additionalHeaders: { [key: string]: string },
): void => {
  if (Array.isArray(existingHeaders)) {
    for (const [headerName, headerValue] of Object.entries(additionalHeaders)) {
      existingHeaders.push([headerName, headerValue]);
    }
    return;
  }

  if (existingHeaders instanceof Headers) {
    for (const [headerName, headerValue] of Object.entries(additionalHeaders)) {
      existingHeaders.set(headerName, headerValue);
    }
    return;
  }

  const recordHeaders = existingHeaders;
  for (const [headerName, headerValue] of Object.entries(additionalHeaders)) {
    recordHeaders[headerName] = headerValue;
  }
};

/**
 * Merges query string parameters into a URL using `URLSearchParams.set`, so each provided name
 * replaces any existing query value with the same name.
 */
export const addQueryParamsToUrl = (url: string, params: { [key: string]: string }): string => {
  if (!url || typeof url !== 'string') return url;
  const urlObject = new URL(url);
  for (const [paramName, paramValue] of Object.entries(params)) {
    urlObject.searchParams.set(paramName, paramValue);
  }

  return urlObject.toString();
};

/**
 * Checks if API token or WAT token is pending (e.g., being generated)
 *
 * @param token - API token
 * @param wat - WAT token
 * @returns true if the token is pending
 */
export const isAuthTokenPending = (token?: string | null, wat?: string | null): boolean => {
  return token === null || wat === null;
};

/**
 * Validates that a URL is safe from SSRF attacks by ensuring it only points to the allowed origin.
 * This ensures URLs are within the expected domain, preventing requests to unauthorized origins.
 *
 * @param url - The URL to validate
 * @param allowedOrigin - The allowed origin (protocol + hostname + port) that requests must match
 * @throws Error if the URL is invalid or represents an SSRF risk
 */
export const validateUrl = (url: string, allowedOrigin: string): void => {
  if (!url || typeof url !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  let urlObject: URL;
  try {
    urlObject = new URL(url);
  } catch {
    throw new Error(`Invalid URL format: ${url}`);
  }

  let allowedUrl: URL;
  try {
    allowedUrl = new URL(allowedOrigin);
  } catch {
    throw new Error(`Invalid url origin format: ${allowedOrigin}`);
  }

  if (urlObject.origin !== allowedUrl.origin) {
    throw new Error(
      `URL origin ${urlObject.origin} does not match allowed origin ${allowedUrl.origin}. SSRF protection: requests must be to the configured base URL only.`,
    );
  }
};
