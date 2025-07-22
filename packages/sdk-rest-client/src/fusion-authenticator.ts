/// <reference lib="dom" />

import { BaseAuthenticator } from './base-authenticator.js';
import { appendHeaders } from './helpers.js';
import { Authenticator } from './interfaces.js';

export interface FusionComponent {
  getParentEventTarget: () => {
    getEnvironment: () => {
      isTokenBasedAuth_: () => boolean;
      getWebSessionToken: () => string;
      getHashedWebAccessToken: () => string;
    };
  };
}

export type FusionWindow = Window &
  typeof globalThis & {
    prism:
      | {
          user: { _id: string | undefined };
          $injector: { get: (name: string) => FusionComponent };
        }
      | undefined;
  };

export class FusionAuthenticator extends BaseAuthenticator {
  constructor() {
    super('fusion');
  }

  private antiCsrfToken: string | undefined;

  private wat: string | undefined;

  private watInitialiser: string | undefined;

  authenticate() {
    const hasUser = !!(window as FusionWindow).prism?.user?._id;
    this._resolve(hasUser);

    const antiCsrfToken = window.document?.cookie?.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)?.[1];
    if (antiCsrfToken) this.antiCsrfToken = antiCsrfToken;

    try {
      const environment = (window as FusionWindow).prism?.$injector
        .get('$component')
        .getParentEventTarget()
        .getEnvironment();

      if (environment?.isTokenBasedAuth_()) {
        this.wat = environment.getWebSessionToken();
        this.watInitialiser = environment.getHashedWebAccessToken();
      }
    } catch (e) {
      // Silently ignore errors if the environment is not available
    }

    return this._result;
  }

  applyHeaders(headers: HeadersInit): void {
    if (this.antiCsrfToken) {
      appendHeaders(headers, {
        'X-Xsrf-Token': this.antiCsrfToken,
      });
    }
    if (this.wat && this.watInitialiser) {
      appendHeaders(headers, {
        Authorization: this.wat,
        Initialiser: this.watInitialiser,
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
