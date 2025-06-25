/* eslint-disable max-params */
import { normalizeUrl } from '@sisense/sdk-common';

import { BearerAuthenticator } from './bearer-authenticator.js';
import { FusionAuthenticator } from './fusion-authenticator.js';
import { Authenticator } from './interfaces.js';
import { PasswordAuthenticator } from './password-authenticator.js';
import { SsoAuthenticator } from './sso-authenticator.js';
import { WatAuthenticator } from './wat-authenticator.js';

type AuthenticatorConfig = {
  url: string;
  username?: string;
  password?: string;
  token?: string | null;
  wat?: string | null;
  ssoEnabled?: boolean;
  enableSilentPreAuth?: boolean;
  useFusionAuth?: boolean;
};

export function getAuthenticator({
  url: rawUrl,
  username,
  password,
  token,
  wat,
  ssoEnabled = false,
  enableSilentPreAuth = false,
  useFusionAuth = false,
}: AuthenticatorConfig): Authenticator | null {
  const url = normalizeUrl(rawUrl);

  // sso overrides all other auth methods
  if (ssoEnabled) {
    return new SsoAuthenticator(normalizeUrl(rawUrl, true), enableSilentPreAuth);
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

  if (useFusionAuth) {
    return new FusionAuthenticator();
  }

  return null;
}
