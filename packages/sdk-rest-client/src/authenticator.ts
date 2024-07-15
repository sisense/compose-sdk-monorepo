/* eslint-disable max-params */
import { Authenticator } from './interfaces.js';
import { PasswordAuthenticator } from './password-authenticator.js';
import { BearerAuthenticator } from './bearer-authenticator.js';
import { WatAuthenticator } from './wat-authenticator.js';
import { SsoAuthenticator } from './sso-authenticator.js';

type AuthenticatorConfig = {
  url: string;
  username?: string;
  password?: string;
  token?: string;
  wat?: string;
  ssoEnabled?: boolean;
  enableSilentPreAuth?: boolean;
};

export function getAuthenticator({
  url,
  username,
  password,
  token,
  wat,
  ssoEnabled = false,
  enableSilentPreAuth = false,
}: AuthenticatorConfig): Authenticator | null {
  // sso overrides all other auth methods
  if (ssoEnabled) {
    return new SsoAuthenticator(url, enableSilentPreAuth);
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
