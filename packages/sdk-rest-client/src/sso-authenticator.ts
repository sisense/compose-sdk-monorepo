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

  private _enableSilentPreAuth: boolean;

  private _valid = true;

  private _authenticating = false;

  constructor(url: string, enableSilentPreAuth = false) {
    this.url = url;
    this._enableSilentPreAuth = enableSilentPreAuth;
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

  private async authenticateSilent(loginUrl: string): Promise<void> {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.src = `${loginUrl}?return_to=${window.location.href}`;

    await new Promise((resolve) => {
      iframe.onload = () => {
        resolve(true);
      };
    });

    document.body.removeChild(iframe);
  }

  private async checkAuthentication(): Promise<{ isAuthenticated: boolean; loginUrl: string }> {
    const fetchUrl = `${this.url}${!this.url.endsWith('/') ? '/' : ''}api/auth/isauth`;
    const response = await fetch(fetchUrl, {
      headers: { Internal: 'true' },
      credentials: 'include',
    });

    const result: IsAuthResponse = await response.json();

    if (!result.isAuthenticated) {
      if (!result.ssoEnabled) {
        throw new TranslatableError('errors.ssoNotEnabled');
      }

      if (!result.loginUrl) {
        throw new TranslatableError('errors.ssoNoLoginUrl');
      }
    }

    return {
      isAuthenticated: result.isAuthenticated,
      loginUrl: `${result.loginUrl}?return_to=${window.location.href}`,
    };
  }

  async authenticate(silent = true): Promise<boolean> {
    this._authenticating = true;
    const { isAuthenticated, loginUrl } = await this.checkAuthentication();
    if (!isAuthenticated) {
      if (this._enableSilentPreAuth && silent) {
        await this.authenticateSilent(loginUrl);
        return this.authenticate(false);
      }
      window?.location?.assign(loginUrl);
      return false;
    } else {
      // no authentication needed, indicate success
      this._authenticating = false;
      return true;
    }
  }
}
