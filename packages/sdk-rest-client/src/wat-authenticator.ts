/// <reference lib="dom" />

/* eslint-disable no-underscore-dangle */
import { appendHeaders } from './helpers.js';
import { Authenticator } from './interfaces.js';

interface WebSessionTokenResponse {
  webSessionToken: string;
  initialiser: string;
}

export class WatAuthenticator implements Authenticator {
  readonly type = 'wat';

  private _initialiser: string | undefined;

  private _webSessionToken: string;

  readonly wat: string;

  readonly url: string;

  private _authenticating = false;

  private _valid = true;

  constructor(url: string, wat: string) {
    this._initialiser = undefined;
    this.url = url;
    this.wat = wat;
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
    if (!!this._webSessionToken && !!this._initialiser) {
      const authHeader = this._webSessionToken;
      const initialiserHeader = this._initialiser;
      appendHeaders(headers, { Authorization: authHeader, Initialiser: initialiserHeader });
    }
  }

  async authenticate(): Promise<boolean> {
    this._authenticating = true;

    // call API to generate web session token
    const url = `${this.url}${!this.url.endsWith('/') ? '/' : ''}api/v1/wat/sessionToken`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: `{"webAccessToken": "${this.wat}"}`,
      });

      if (response.ok) {
        const responseJson = (await response.json()) as WebSessionTokenResponse;

        this._initialiser = responseJson.initialiser;
        this._webSessionToken = responseJson.webSessionToken;
        this._authenticating = false;
      } else {
        return false;
      }
    } catch (e: unknown) {
      this._initialiser = undefined;
      this._authenticating = false;
      return false;
    }

    return true;
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
