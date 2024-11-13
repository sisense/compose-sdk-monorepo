/// <reference lib="dom" />

import { normalizeUrl } from '@sisense/sdk-common';
import { Authenticator } from './interfaces.js';
import { BaseAuthenticator } from './base-authenticator.js';
import { appendHeaders } from './helpers.js';
import { TranslatableError } from './translation/translatable-error.js';
import { errorInterceptor } from './interceptors.js';

interface WebSessionTokenResponse {
  webSessionToken: string;
  initialiser: string;
}

export class WatAuthenticator extends BaseAuthenticator {
  private _initialiser: string | undefined;

  private _webSessionToken: string;

  private readonly url: string;

  private readonly body: string;

  constructor(url: string, wat: string) {
    super('wat');
    this.url = `${normalizeUrl(url)}api/v1/wat/sessionToken`;
    this.body = `{"webAccessToken": "${wat}"}`;
  }

  async authenticate() {
    if (this._tried) {
      return this._result;
    }
    this._tried = true;

    try {
      this._authenticating = true;

      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: this.body,
      }).catch(errorInterceptor);

      if (response.ok) {
        const responseJson: WebSessionTokenResponse = await response.json();
        this._initialiser = responseJson.initialiser;
        this._webSessionToken = responseJson.webSessionToken;
        this._resolve(true);
      }
    } catch (e: unknown) {
      // rather than returning empty catch block
      // throw an error to be caught by Sisense context provider
      throw new TranslatableError('errors.tokenAuthFailed');
    } finally {
      this._resolve(false);
      this._authenticating = false;
    }

    return this._result;
  }

  applyHeader(headers: HeadersInit) {
    if (!!this._webSessionToken && !!this._initialiser) {
      const authHeader = this._webSessionToken;
      const initialiserHeader = this._initialiser;
      appendHeaders(headers, { Authorization: authHeader, Initialiser: initialiserHeader });
    }
  }
}

/**
 * Checks if an authenticator is a WatAuthenticator.
 *
 * @param authenticator - the authenticator to check
 * @internal
 */
export function isWatAuthenticator(
  authenticator: Authenticator,
): authenticator is WatAuthenticator {
  return authenticator.type === 'wat';
}
