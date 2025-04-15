import { BaseAuthenticator } from './base-authenticator.js';
import { appendHeaders } from './helpers.js';
import { Authenticator } from './interfaces.js';

export class BearerAuthenticator extends BaseAuthenticator {
  readonly bearer: string;

  constructor(url: string, bearer: string) {
    super('bearer');
    this.bearer = bearer;
    this._resolve(true);
  }

  applyHeader(headers: HeadersInit) {
    const authHeader = 'Bearer ' + this.bearer;
    appendHeaders(headers, { Authorization: authHeader });
  }

  authenticate() {
    // TODO: implement authentication test

    return this._result;
  }

  authenticated() {
    return this._result;
  }
}

/**
 * Checks if an authenticator is a BearerAuthenticator.
 *
 * @param authenticator - The authenticator to check.
 * @internal
 */
export function isBearerAuthenticator(
  authenticator: Authenticator,
): authenticator is BearerAuthenticator {
  return authenticator.type === 'bearer';
}
