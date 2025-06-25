/// <reference lib="dom" />

import { normalizeUrl } from '@sisense/sdk-common';

import { BaseAuthenticator } from './base-authenticator.js';
import { addPathnameToUrl, addQueryParamsToUrl } from './helpers.js';
import { errorInterceptor } from './interceptors.js';
import { Authenticator } from './interfaces.js';
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
    this.url = normalizeUrl(url, true);
    this._enableSilentPreAuth = enableSilentPreAuth;
  }

  async authenticate(silent = true) {
    try {
      this._authenticating = true;

      const { isAuthenticated, loginUrl: url } = await this.checkAuthentication();

      if (isAuthenticated) {
        this._resolve(true);
        return await this._result;
      }

      const loginUrl = addQueryParamsToUrl(url, { return_to: window.location.href });

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
    iframe.src = loginUrl;

    await new Promise((resolve) => {
      iframe.onload = () => {
        resolve(true);
      };
    });

    document.body.removeChild(iframe);
  }

  private async checkAuthentication(): Promise<{ isAuthenticated: boolean; loginUrl: string }> {
    const fetchUrl = addPathnameToUrl(normalizeUrl(this.url), 'api/auth/isauth');

    const response = await fetch(fetchUrl, {
      headers: { Internal: 'true' },
      credentials: 'include',
    }).catch(errorInterceptor);

    // covers the case when isAuth returns 200 with html in the body
    // (i.e. redirect to /app/main for deleted user)
    if (
      response.status === 200 &&
      !response.headers?.get('Content-Type')?.includes('application/json')
    ) {
      throw new TranslatableError('errors.authFailed');
    }

    const result: IsAuthResponse = await response.json();

    if (!result.isAuthenticated) {
      if (!result.ssoEnabled) {
        throw new TranslatableError('errors.ssoNotEnabled');
      }

      if (!result.loginUrl) {
        throw new TranslatableError('errors.ssoNoLoginUrl');
      }
    }

    // Workaround: if the loginUrl looks like a relative URL to ssoRouter plugin, prepend the Sisense URL
    const redirectUrl =
      result.loginUrl && result.loginUrl?.search(/^\/api\/v\d+\/[^/]+\/login$/) !== -1
        ? addPathnameToUrl(this.url, result.loginUrl)
        : result.loginUrl || '';

    return {
      isAuthenticated: result.isAuthenticated,
      loginUrl: redirectUrl,
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
