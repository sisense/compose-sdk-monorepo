import EventEmitter from 'events';

import { SocketI } from '../types.js';

export class TestSocket implements SocketI {
  /** @private */
  events: EventEmitter;

  /** @private */
  ready: boolean = true;

  /** @private */
  onMessageCallback?: (type: string, data: any) => void;

  constructor() {
    this.events = new EventEmitter();
    this.ready = true;
  }

  /**
   * Checks if socket is ready for sending messages or not
   *
   * @returns {boolean} - true - ready
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Attach event handler
   *
   * @param {string} event - event name
   * @param {Function} cb - handler function
   * @returns {void}
   */
  on(event: string, cb: (...args: Array<any>) => void): void {
    this.events.on(event, cb);
  }

  /**
   * Detach event handler
   *
   * @param {string} event - event name
   * @param {Function} cb - handler function
   * @returns {void}
   */
  off(event: string, cb: (...args: Array<any>) => void): void {
    this.events.removeListener(event, cb);
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
    const noUsed = event || args;
    this.ready = !!noUsed || true;
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
    const handler = () => {};
    this.on('message', handler);

    return () => {
      this.off('message', handler);
    };
  }

  /**
   * Emulate receiving message from socket
   *
   * @param {string} event - message type
   * @param {any} data - message data
   * @returns {Promise} - waiting promise
   */
  trigger(event: string, data: any): any {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (this.onMessageCallback) {
          this.onMessageCallback(event, data);
        }
        resolve();
      }, 10);
    });
  }
}

export default TestSocket;
