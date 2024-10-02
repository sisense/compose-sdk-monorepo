export const appendHeaders = (
  existingHeaders: HeadersInit,
  additionalHeaders: { [key: string]: string },
): void => {
  for (const [headerName, headerValue] of Object.entries(additionalHeaders)) {
    if (Array.isArray(existingHeaders)) {
      existingHeaders.push([headerName, headerValue]);
    } else if (typeof existingHeaders.set === 'function') {
      existingHeaders.set(headerName, headerValue);
    } else {
      // eslint-disable-next-line security/detect-object-injection
      existingHeaders[headerName] = headerValue;
    }
  }
};

export const addQueryParamsToUrl = (url: string, params: { [key: string]: string }): string => {
  // can't just append to the url because it might already have a query string
  const urlObject = new URL(url);
  for (const [paramName, paramValue] of Object.entries(params)) {
    urlObject.searchParams.append(paramName, paramValue);
  }

  // replace the trailing slash if there is one
  return urlObject.toString().replace(/\/([?&])/, '$1');
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
