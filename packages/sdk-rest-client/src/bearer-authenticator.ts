/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { appendHeaders } from './helpers.js';
import { Authenticator } from './interfaces.js';

export class BearerAuthenticator implements Authenticator {
  readonly bearer: string;

  readonly url: string;

  private _valid = true;

  constructor(url: string, bearer: string) {
    this.bearer = bearer;
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
    const authHeader = 'Bearer ' + this.bearer;
    appendHeaders(headers, { Authorization: authHeader });
  }

  async authenticate(): Promise<boolean> {
    // TODO: implement authentication test

    return Promise.resolve(true);
  }
}
