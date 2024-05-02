import { SocketI, SocketQueryOptions } from '../data-load/types.js';
import {
  BearerAuthenticator,
  HttpClient,
  isBearerAuthenticator,
  isSsoAuthenticator,
  isWatAuthenticator,
  SsoAuthenticator,
  WatAuthenticator,
} from '@sisense/sdk-rest-client';
import { SisenseSocket } from '../data-load/index.js';
import TestSocket from '../data-load/sockets/TestSocket.js';

/**
 * Builder to create a web socket client on demand to communicate with a Sisense web socket server.
 *
 * @internal
 */
const ENDPOINT_PIVOT = 'pivot2';
export class SocketBuilder {
  private _socket: SocketI;

  private readonly _httpClient: HttpClient;

  /**
   * Boolean flag to indicate if the socket should be mocked or not (for testing).
   *
   * @internal
   */
  private readonly _mockSocket: boolean;

  constructor(httpClient: HttpClient, mockSocket = false) {
    this._httpClient = httpClient;
    this._mockSocket = mockSocket;
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
      if (this._mockSocket) {
        // use a mock socket for testing
        this._socket = new TestSocket();
        return this._socket;
      }

      const auth = this._httpClient.auth;
      const url = this._httpClient.url;
      let query: SocketQueryOptions = {};

      // Do not use instanceof because it checks if the constructors are the same.
      // However, when the class is imported from @sisense/sdk-rest-client,
      // the code gets its own copy of the constructor from the code in the library,
      // so they are not the same instance anymore.
      // Reference: https://stackoverflow.com/a/63937850/2425556
      if (isBearerAuthenticator(auth)) {
        query = this.getQueryOptionsBearer(auth);
      } else if (isWatAuthenticator(auth)) {
        query = this.getQueryOptionsWat(auth);
      } else if (isSsoAuthenticator(auth)) {
        query = this.getQueryOptionsSso(auth);
      }

      this._socket = new SisenseSocket(url + ENDPOINT_PIVOT, query);
    }

    return this._socket;
  }
}
