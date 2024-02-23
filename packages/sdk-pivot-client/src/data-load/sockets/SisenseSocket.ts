/* eslint-disable @typescript-eslint/ban-types */
import io from 'socket.io-client';
import { SocketI, SocketQueryOptions } from '../types.js';

export class SisenseSocket implements SocketI {
  /**
    @private */
  socket: SocketIOClient.Socket;

  /**
    @private */
  onMessageCallback?: (type: string, data: any) => void;

  constructor(data: string | SocketIOClient.Socket, query: SocketQueryOptions) {
    if (typeof data === 'string') {
      this.socket = SisenseSocket.createNewSocket(data, query);
    } else {
      this.socket = data;
    }
  }

  /**
   * Checks if socket is ready for sending messages or not
   *
   * @returns {boolean} - true - ready
   */
  isReady(): boolean {
    // return this.socket.registeredInSisense;
    return this.socket.connected;
  }

  /**
   * Attach event handler
   *
   * @param {string} event - event name
   * @param {Function} cb - handler function
   * @returns {void}
   */
  on(event: string, cb: Function): void {
    this.socket.on(event, cb);
  }

  /**
   * Detach event handler
   *
   * @param {string} event - event name
   * @param {Function} cb - handler function
   * @returns {void}
   */
  off(event: string, cb: Function): void {
    this.socket.off(event, cb);
  }

  /**
   * Send message via socket
   *
   * @param {string} event - message name
   * @param {Array<any>} args - arguments
   * @param {Array<any>} args.0 - message data
   * @returns {void}
   */
  send(event: string, ...args: any[]): void {
    const data = args[0];
    this.socket.emit(event, JSON.stringify(data));
  }

  /**
   * Specific message handler
   *
   * @param {string} type - message type
   * @param {string} subType - message subtype (query ID)
   * @param {Function} callback - handler function
   * @returns {Function} - unsubscribe function
   */
  onMessage(
    type: string,
    subType: string,
    callback: (type: string, data: any) => void,
  ): () => void {
    this.onMessageCallback = callback;
    const eventType = type || '';
    const eventSubType = subType || '';
    const eventName = eventSubType ? `${eventType}-${eventSubType}` : eventType;
    const handler = (event: string) => {
      let data = null;
      try {
        data = JSON.parse(event);
      } catch (err) {
        throw new Error('Error parsing response message');
      }
      callback(eventType, data);
    };
    this.on(eventName, handler);

    return () => {
      this.off(eventName, handler);
    };
  }

  /**
   * Emulate receiving message from socket
   *
   * @param {string} event - message type
   * @param {any} data - message data
   * @returns {void}
   */
  trigger(event: string, data: any): any {
    if (this.onMessageCallback) {
      this.onMessageCallback(event, data);
    }
  }

  static createNewSocket(url: string, query: SocketQueryOptions) {
    const socket = io.connect(url, {
      path: '/gateway',
      transports: ['websocket'],
      reconnection: true,
      query,
    });

    socket.on('connect_error', (err: Error) => {
      console.log(`connect_error due to ${err.message}`);
    });

    socket.on('connect', () => {
      // console.log('socket connect', socket.id);
      socket.emit('register', {});
    });

    socket.on('register', () => {
      socket.emit('{"eventName": "_registerEvent", "data": "pivot2"}');
      // socket.registeredInSisense = true;

      socket.connected = true;
    });

    socket.on('error', (err: Error) => {
      // eslint-disable-next-line no-console
      console.warn(`"SisenseSocket" socket error "${err}"`);
    });

    return socket;
  }
}

export default SisenseSocket;
