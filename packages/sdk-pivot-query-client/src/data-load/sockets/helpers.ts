/**
 * Get XSRF token from `document.cookie`
 */
function getCsrfToken(cookie = document.cookie) {
  const csrfCookieName = 'XSRF-TOKEN';
  const match = cookie.match(new RegExp(`(^| )${csrfCookieName}=([^;]+)`));

  if (match !== null && match[2]) {
    return match[2];
  }
  return null;
}

/**
 * Prepare data for CSRF response
 */
export function getCsrfResponseData() {
  const csrfToken = getCsrfToken();
  const data = {};

  // The CSRF token is optional, but the domain needs to be added to the whitelist to pass the check without a token
  if (csrfToken) {
    data['X-XSRF-TOKEN'] = csrfToken;
  }

  return data;
}
