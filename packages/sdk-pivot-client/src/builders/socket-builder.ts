import { SocketI, SocketQueryOptions } from '../data-load/types.js';
import {
  BearerAuthenticator,
  HttpClient,
  SsoAuthenticator,
  WatAuthenticator,
} from '@sisense/sdk-rest-client';
import { SisenseSocket } from '../data-load/index.js';

/**
 * Builder to create a web socket client on demand to communicate with a Sisense web socket server.
 *
 * @internal
 */
const ENDPOINT_PIVOT = 'pivot2';
export class SocketBuilder {
  private _socket: SocketI;

  private readonly _httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this._httpClient = httpClient;
  }

  private getQueryOptionsSso(auth: SsoAuthenticator): SocketQueryOptions {
    // No need to add query params as SSO authentication
    // is using cookies sent automatically by the browser
    return {};
  }

  private getQueryOptionsBearer(auth: BearerAuthenticator): SocketQueryOptions {
    const authToken = auth.bearer;
    if (!authToken) {
      throw new Error('Missing bearer token');
    }
    return {
      token: authToken,
    };
  }

  private getQueryOptionsWat(auth: WatAuthenticator): SocketQueryOptions {
    const headers = new Headers();
    auth.applyHeader(headers);
    const authorization = headers.get('Authorization');
    const initialiser = headers.get('Initialiser');
    if (!authorization || !initialiser) {
      throw new Error('Missing auth header');
    }
    return {
      authorization,
      initialiser,
    };
  }

  get socket(): SocketI {
    // initialize socket only when needed
    if (!this._socket) {
      const auth = this._httpClient.auth;
      const url = this._httpClient.url;
      let query: SocketQueryOptions = {};
      if (auth instanceof BearerAuthenticator) {
        query = this.getQueryOptionsBearer(auth);
      } else if (auth instanceof WatAuthenticator) {
        query = this.getQueryOptionsWat(auth);
      } else if (auth instanceof SsoAuthenticator) {
        query = this.getQueryOptionsSso(auth);
      }

      this._socket = new SisenseSocket(url + ENDPOINT_PIVOT, query);
    }

    return this._socket;
  }
}
