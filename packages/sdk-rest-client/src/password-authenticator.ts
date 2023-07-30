/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/// <reference lib="dom" />
import { appendHeaders } from './helpers.js';
import { Authenticator } from './interfaces.js';

export class PasswordAuthenticator implements Authenticator {
  private _authheader: string | undefined;

  readonly user: string;

  readonly pass: string;

  readonly url: string;

  private _authenticating = false;

  private _valid = true;

  constructor(url: string, user: string, pass: string) {
    this._authheader = undefined;
    this.url = url;
    this.user = user;
    this.pass = pass;
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
    const authHeader = 'Bearer ' + this._authheader;
    appendHeaders(headers, { Authorization: authHeader });
  }

  async authenticate(): Promise<boolean> {
    this._authenticating = true;

    const url = `${this.url}${!this.url.endsWith('/') ? '/' : ''}api/v1/authentication/login`;
    const username = encodeURIComponent(this.user);
    const password = encodeURIComponent(this.pass);

    await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${username}&password=${password}`,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this._authheader = responseJson.access_token;
        this._authenticating = false;
      });

    return !!this._authheader;
  }
}
