export const appendHeaders = (
  existingHeaders: HeadersInit,
  additionalHeaders: { [key: string]: string },
): void => {
  for (const [headerName, headerValue] of Object.entries(additionalHeaders)) {
    if (existingHeaders instanceof Headers) {
      existingHeaders.set(headerName, headerValue);
    } else if (Array.isArray(existingHeaders)) {
      existingHeaders.push([headerName, headerValue]);
    } else {
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
