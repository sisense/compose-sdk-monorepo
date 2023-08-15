/* eslint-disable max-params */
import { Authenticator } from './interfaces.js';
import { PasswordAuthenticator } from './password-authenticator.js';
import { BearerAuthenticator } from './bearer-authenticator.js';
import { WatAuthenticator } from './wat-authenticator.js';
import { SsoAuthenticator } from './sso-authenticator.js';

export function getAuthenticator(
  url: string,
  username: string | undefined,
  password: string | undefined,
  token: string | undefined,
  wat: string | undefined,
  ssoEnabled: boolean | undefined,
): Authenticator | null {
  // sso overrides all other auth methods
  if (ssoEnabled) {
    return new SsoAuthenticator(url);
  }

  // username/password or tokens are chosen relative to priority
  if (username && password) {
    return new PasswordAuthenticator(url, username, password);
  }

  if (token) {
    return new BearerAuthenticator(url, token);
  }

  if (wat) {
    return new WatAuthenticator(url, wat);
  }

  return null;
}
