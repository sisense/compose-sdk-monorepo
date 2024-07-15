import { Authenticator } from './interfaces.js';

export class BaseAuthenticator implements Authenticator {
  readonly type: Authenticator['type'];

  private _valid = true;

  protected _authenticating = false;

  protected _tried = false;

  protected _resolve: (value: boolean) => void;

  protected readonly _result = new Promise<boolean>((resolve) => {
    this._resolve = resolve;
  });

  protected constructor(type: Authenticator['type']) {
    this.type = type;
  }

  isValid(): boolean {
    return this._valid;
  }

  invalidate() {
    this._valid = false;
  }

  authenticate() {
    return this._result;
  }

  isAuthenticating() {
    return this._authenticating;
  }

  authenticated() {
    return this._result;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  applyHeader(headers: HeadersInit) {
    // Do nothing
  }
}
