/// <reference lib="dom" />
import { Authenticator } from './interfaces.js';
import { BaseAuthenticator } from './base-authenticator.js';
import { appendHeaders } from './helpers.js';

export class PasswordAuthenticator extends BaseAuthenticator {
  private readonly url: string;

  private readonly body: string;

  private _authheader = '';

  constructor(url: string, user: string, pass: string) {
    super('password');
    this.url = `${url}${!url.endsWith('/') ? '/' : ''}api/v1/authentication/login`;
    const username = encodeURIComponent(user);
    const password = encodeURIComponent(pass);
    this.body = `username=${username}&password=${password}`;
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
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: this.body,
      });

      if (response.ok) {
        const json = await response.json();
        this._authheader = json.access_token;
      }
    } finally {
      this._resolve(!!this._authheader);
      this._authenticating = false;
    }

    return this._result;
  }

  applyHeader(headers: HeadersInit) {
    const authHeader = 'Bearer ' + this._authheader;
    appendHeaders(headers, { Authorization: authHeader });
  }
}

/**
 * Checks if an authenticator is a PasswordAuthenticator.
 *
 * @param authenticator - the authenticator to check
 * @internal
 */
export function isPasswordAuthenticator(
  authenticator: Authenticator,
): authenticator is PasswordAuthenticator {
  return authenticator.type === 'password';
}
