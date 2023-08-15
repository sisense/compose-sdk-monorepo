/// <reference lib="dom" />

/* eslint-disable no-underscore-dangle */

import { Authenticator } from './interfaces.js';

export class SsoAuthenticator implements Authenticator {
  readonly url: string;

  private _valid = true;

  constructor(url: string) {
    this.url = url;
  }

  isValid(): boolean {
    return this._valid;
  }

  invalidate() {
    this._valid = false;
  }

  isAuthenticating(): boolean {
    return false;
  }

  applyHeader(headers: HeadersInit) {
    return headers;
  }

  async authenticate(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
