/// <reference lib="dom" />

/* eslint-disable no-underscore-dangle */

import { Authenticator } from './interfaces.js';

interface IsAuthResponse {
  isAuthenticated: boolean;
  ssoEnabled?: boolean;
  loginUrl?: string;
}

export class SsoAuthenticator implements Authenticator {
  readonly url: string;

  private _valid = true;

  private _authenticating = false;

  constructor(url: string) {
    this.url = url;
  }

  isValid(): boolean {
    return this._valid;
  }

  invalidate() {
    this._valid = false;
  }

  isAuthenticating(): boolean {
    return this._authenticating;
  }

  applyHeader(headers: HeadersInit) {
    return headers;
  }

  async authenticate(): Promise<boolean> {
    this._authenticating = true;
    const fetchUrl = `${this.url}${!this.url.endsWith('/') ? '/' : ''}api/auth/isauth`;
    return fetch(fetchUrl, {
      headers: { Internal: 'true' },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((res: IsAuthResponse) => {
        this._authenticating = false;
        if (!res.isAuthenticated) {
          // SSO is disabled on instance, do not proceed
          if (!res.ssoEnabled)
            throw new Error(
              'SSO is not enabled on target instance, please choose another authentication method',
            );
          // redirect to login page
          window.location.href = `${res.loginUrl}?return_to=${window.location.href}`;
        }
        // no authentication needed, indicate success
        return true;
      });
  }
}
