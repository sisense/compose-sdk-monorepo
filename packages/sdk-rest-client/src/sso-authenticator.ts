/// <reference lib="dom" />

/* eslint-disable no-underscore-dangle */

import { Authenticator } from './interfaces.js';
import { TranslatableError } from './translation/translatable-error.js';

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
        if (!res.isAuthenticated) {
          // SSO is disabled on instance, do not proceed
          if (!res.ssoEnabled) throw new TranslatableError('errors.ssoNotEnabled');
          // redirect to login page
          window?.location?.assign(`${res.loginUrl}?return_to=${window.location.href}`);
          return false;
        } else {
          // no authentication needed, indicate success
          this._authenticating = false;
          return true;
        }
      });
  }
}
