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
    try {
      this._authenticating = true;
      return await this.checkAuthentication();
    } catch (error) {
      return false;
    } finally {
      this._authenticating = false;
    }
  }

  /**
   * Check if the user is authenticated.
   *
   * If the user is not authenticated, it will try to authenticate with silent SSO.
   * If silent SSO fails, it will redirect the user to the login page.
   *
   * @param silent
   * @private
   */
  private async checkAuthentication(silent: boolean = true): Promise<boolean> {
    const fetchUrl = `${this.url}${!this.url.endsWith('/') ? '/' : ''}api/auth/isauth`;
    const response = await fetch(fetchUrl, {
      headers: {Internal: 'true'},
      credentials: 'include',
    });

    const {isAuthenticated, ssoEnabled, loginUrl}: IsAuthResponse = await response.json();

    if (isAuthenticated) {
      return true;
    }

    if (!ssoEnabled || loginUrl === undefined) {
      throw new TranslatableError('errors.ssoNotEnabled');
    }

    // try with silent SSO first and check again with silent=false
    if (silent) {
      await this.authenticateWithSilentSSO(loginUrl);
      return this.checkAuthentication(false);
    }

    // if silent SSO failed, redirect to login page
    window.location.href = `${loginUrl}?return_to=${window.location.href}`;
    return false;
  }

  private async authenticateWithSilentSSO(loginUrl: string): Promise<void> {
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
}

