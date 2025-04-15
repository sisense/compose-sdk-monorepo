/// <reference lib="dom" />

import { BaseAuthenticator } from './base-authenticator.js';
import { appendHeaders } from './helpers.js';
import { Authenticator } from './interfaces.js';

export type FusionWindow = Window &
  typeof globalThis & { prism: { user: { _id: string | undefined } } | undefined };

export class FusionAuthenticator extends BaseAuthenticator {
  constructor() {
    super('fusion');
  }

  private antiCsrfToken: string | undefined;

  authenticate() {
    const hasUser = !!(window as FusionWindow).prism?.user?._id;
    this._resolve(hasUser);

    const antiCsrfToken = window.document?.cookie?.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)?.[1];
    if (antiCsrfToken) this.antiCsrfToken = antiCsrfToken;

    return this._result;
  }

  applyHeader(headers: HeadersInit): void {
    if (this.antiCsrfToken) {
      appendHeaders(headers, {
        'X-Xsrf-Token': this.antiCsrfToken,
      });
    }
  }
}

/**
 * Checks if the authenticator is SSO authenticator
 *
 * @param authenticator - authenticator to check
 * @internal
 */
export function isFusionAuthenticator(
  authenticator: Authenticator,
): authenticator is FusionAuthenticator {
  return authenticator.type === 'fusion';
}
