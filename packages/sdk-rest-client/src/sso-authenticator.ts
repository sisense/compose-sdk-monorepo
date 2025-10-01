/// <reference lib="dom" />

import { mergeUrlsWithParams, normalizeUrl } from '@ethings-os/sdk-common';

import { BaseAuthenticator } from './base-authenticator.js';
import { addQueryParamsToUrl } from './helpers.js';
import { errorInterceptor } from './interceptors.js';
import { Authenticator } from './interfaces.js';
import { TranslatableError } from './translation/translatable-error.js';

interface IsAuthResponse {
  isAuthenticated: boolean;
  ssoEnabled?: boolean;
  loginUrl?: string;
}

/**
 * Authenticator for handling SSO (Single Sign-On) authentication flow
 */
export class SsoAuthenticator extends BaseAuthenticator {
  readonly url: string;

  private readonly _enableSilentPreAuth: boolean;

  private readonly _alternativeSsoHost: string;

  constructor(url: string, enableSilentPreAuth = false, alternativeSsoHost = '') {
    super('sso');
    this.url = normalizeUrl(url, true);
    this._enableSilentPreAuth = enableSilentPreAuth;
    this._alternativeSsoHost = alternativeSsoHost;
  }

  /**
   * Attempts to authenticate the user via SSO.
   * If silent mode is enabled and supported, tries silent authentication first.
   *
   * @param silent - Whether to attempt silent authentication first
   * @returns Promise resolving to authentication result
   */
  async authenticate(silent = true): Promise<boolean> {
    try {
      this._authenticating = true;

      const { isAuthenticated, loginUrl: authUrl } = await this.checkAuthentication();

      if (isAuthenticated) {
        this._resolve(true);
        return await this._result;
      }

      let finalLoginUrl = '';
      try {
        // Check if authUrl is a valid absolute path URL (with http)
        new URL(authUrl);
        finalLoginUrl = authUrl;
        // If authUrl is a relative path, combine it with the base URL
        // If the user specifies an alternative host, prioritize using that host
        // Otherwise, default to the connection's configured host
      } catch {
        finalLoginUrl = mergeUrlsWithParams(this._alternativeSsoHost || this.url, authUrl);
      }

      finalLoginUrl = addQueryParamsToUrl(finalLoginUrl, { return_to: window.location.href });

      if (this._enableSilentPreAuth && silent) {
        await this.authenticateSilent(finalLoginUrl);
        const { isAuthenticated } = await this.checkAuthentication();
        if (isAuthenticated) {
          this._resolve(true);
          return await this._result;
        }
      }

      window?.location?.replace(finalLoginUrl);
    } finally {
      this._resolve(false);
      this._authenticating = false;
    }
    return this._result;
  }

  /**
   * Attempts silent authentication using an invisible iframe
   *
   * @param loginUrl - The URL to load in the iframe
   */
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

  /**
   * Checks the current authentication status with the server
   *
   * @returns Promise with authentication status and login URL if needed
   * @throws {TranslatableError} If authentication check fails
   */
  private async checkAuthentication(): Promise<{ isAuthenticated: boolean; loginUrl: string }> {
    const fetchUrl = mergeUrlsWithParams(this.url, 'api/auth/isauth');

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

    return {
      isAuthenticated: result.isAuthenticated,
      loginUrl: result.loginUrl || '',
    };
  }
}

/**
 * Type guard to check if an authenticator is an SSO authenticator
 *
 * @param authenticator - The authenticator to check
 * @returns boolean indicating if the authenticator is an SSO authenticator
 * @internal
 */
export function isSsoAuthenticator(
  authenticator: Authenticator,
): authenticator is SsoAuthenticator {
  return authenticator.type === 'sso';
}
