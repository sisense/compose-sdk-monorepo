/// <reference lib="dom" />

import { Authenticator } from './interfaces.js';
import { BaseAuthenticator } from './base-authenticator.js';
import { TranslatableError } from './translation/translatable-error.js';

interface IsAuthResponse {
  isAuthenticated: boolean;
  ssoEnabled?: boolean;
  loginUrl?: string;
}

export class SsoAuthenticator extends BaseAuthenticator {
  readonly url: string;

  private _enableSilentPreAuth: boolean;

  constructor(url: string, enableSilentPreAuth = false) {
    super('sso');
    this.url = url;
    this._enableSilentPreAuth = enableSilentPreAuth;
  }

  async authenticate(silent = true) {
    try {
      this._authenticating = true;

      const { isAuthenticated, loginUrl } = await this.checkAuthentication();

      if (isAuthenticated) {
        this._resolve(true);
        return await this._result;
      }

      if (this._enableSilentPreAuth && silent) {
        await this.authenticateSilent(loginUrl);
        const { isAuthenticated } = await this.checkAuthentication();
        if (isAuthenticated) {
          this._resolve(true);
          return await this._result;
        }
      }

      window?.location?.replace(loginUrl);
    } finally {
      this._resolve(false);
      this._authenticating = false;
    }
    return this._result;
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
}

/**
 * Checks if the authenticator is SSO authenticator
 *
 * @param authenticator - authenticator to check
 * @internal
 */
export function isSsoAuthenticator(
  authenticator: Authenticator,
): authenticator is SsoAuthenticator {
  return authenticator.type === 'sso';
}
