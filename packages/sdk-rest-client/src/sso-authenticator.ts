/// <reference lib="dom" />
import { mergeUrlsWithParams, normalizeUrl } from '@sisense/sdk-common';

import { BaseAuthenticator } from './base-authenticator.js';
import { addQueryParamsToUrl } from './helpers.js';
import { errorInterceptor } from './interceptors.js';
import { Authenticator } from './interfaces.js';
import { TranslatableError } from './translation/translatable-error.js';

const SSO_REDIRECT_COUNT_KEY_PREFIX = 'sisense_sso_redirect_attempts_';
const SSO_REDIRECT_LAST_AT_KEY_PREFIX = 'sisense_sso_redirect_last_at_';
/** Maximum number of SSO redirects before stopping */
const DEFAULT_MAX_AUTH_REDIRECT_ATTEMPTS = 3;
/** Milliseconds after the latest stored redirect timestamp before the counter resets */
const DEFAULT_REDIRECT_ATTEMPTS_TTL_MS = 5000;

interface IsAuthResponse {
  isAuthenticated: boolean;
  ssoEnabled?: boolean;
  loginUrl?: string;
}

/**
 * Authenticator for handling SSO (Single Sign-On) authentication flow.
 * Tracks redirect attempts in localStorage to avoid infinite refresh loops when
 * auth cookies fail to land (e.g. third-party cookie restrictions, SSO config issues).
 */
export class SsoAuthenticator extends BaseAuthenticator {
  readonly url: string;

  private readonly _enableSilentPreAuth: boolean;

  private readonly _alternativeSsoHost: string;

  private readonly _ssoMaxAuthRedirectAttempts: number;

  private readonly _ssoRedirectAttemptsTtlMs: number;

  constructor(
    url: string,
    enableSilentPreAuth = false,
    alternativeSsoHost = '',
    ssoMaxAuthRedirectAttempts = DEFAULT_MAX_AUTH_REDIRECT_ATTEMPTS,
    ssoRedirectAttemptsTtlMs = DEFAULT_REDIRECT_ATTEMPTS_TTL_MS,
  ) {
    super('sso');
    this.url = normalizeUrl(url, true);
    this._enableSilentPreAuth = enableSilentPreAuth;
    this._alternativeSsoHost = alternativeSsoHost;
    this._ssoMaxAuthRedirectAttempts = Math.max(1, ssoMaxAuthRedirectAttempts);
    this._ssoRedirectAttemptsTtlMs = Math.max(0, ssoRedirectAttemptsTtlMs);
  }

  private getRedirectCountStorageKey(): string {
    return SSO_REDIRECT_COUNT_KEY_PREFIX + encodeURIComponent(this.url);
  }

  private getRedirectLastAtStorageKey(): string {
    return SSO_REDIRECT_LAST_AT_KEY_PREFIX + encodeURIComponent(this.url);
  }

  private getRedirectAttempts(): number {
    try {
      if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
        return 0;
      }
      const rawCount = window.localStorage.getItem(this.getRedirectCountStorageKey());
      const rawLastAt = window.localStorage.getItem(this.getRedirectLastAtStorageKey());

      if (rawCount == null && rawLastAt == null) {
        return 0;
      }

      const count = parseInt(rawCount ?? '', 10);
      const lastAt = parseInt(rawLastAt ?? '', 10);
      if (isNaN(count) || isNaN(lastAt) || count < 0) {
        this.clearRedirectAttempts();
        return 0;
      }

      if (
        this._ssoRedirectAttemptsTtlMs > 0 &&
        Date.now() - lastAt > this._ssoRedirectAttemptsTtlMs
      ) {
        this.clearRedirectAttempts();
        return 0;
      }

      return Math.max(0, count);
    } catch {
      return 0;
    }
  }

  private clearRedirectAttempts(): void {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.removeItem(this.getRedirectCountStorageKey());
        window.localStorage.removeItem(this.getRedirectLastAtStorageKey());
      }
    } catch {
      // ignore
    }
  }

  private persistRedirectAttempts(nextCount: number): void {
    try {
      if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
        return;
      }
      const now = Date.now();
      window.localStorage.setItem(this.getRedirectCountStorageKey(), String(nextCount));
      window.localStorage.setItem(this.getRedirectLastAtStorageKey(), String(now));
    } catch {
      // ignore
    }
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
        this.clearRedirectAttempts();
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

      const attempts = this.getRedirectAttempts();
      if (attempts >= this._ssoMaxAuthRedirectAttempts) {
        throw new TranslatableError('errors.authRedirectLimitExceeded');
      }

      if (this._enableSilentPreAuth && silent) {
        await this.authenticateSilent(finalLoginUrl);
        const { isAuthenticated: silentOk } = await this.checkAuthentication();
        if (silentOk) {
          this.clearRedirectAttempts();
          this._resolve(true);
          return await this._result;
        }
      }

      this.persistRedirectAttempts(attempts + 1);
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
