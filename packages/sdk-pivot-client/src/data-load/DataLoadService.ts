/* eslint-disable @typescript-eslint/ban-types */
import EventEmitter from 'events';
import { AbstractDataLoadService } from './AbstractDataLoadService.js';
import { debug, cloneObject } from '../utils/index.js';
import { MessageType } from './constants.js';
import { DataLoadServiceI, SocketI } from './types.js';
import { LoggerI } from '../utils/types.js';

export class DataLoadService extends AbstractDataLoadService implements DataLoadServiceI {
  /**
   * @private
   *
   * Active WebSocket connection instance
   */
  socket: SocketI;

  /**
   * @private
   *
   * WebSocket initialization delay promise
   */
  initPromise?: Promise<void> = undefined;

  /**
   *
   * @private
   *
   * WebSocket initialization ready flag
   */
  isInitInProgress = false;

  /**
   *
   * @private
   *
   * onMessage remove listeners callback
   */
  onMessageCancel?: Function = undefined;

  constructor(socket?: SocketI, events?: EventEmitter, logger?: LoggerI) {
    super(events);
    this.logger = logger || debug.create('DataLoadService');

    if (!socket) {
      throw new Error(`${this.logger.getName()} "socket" not defined.`);
    }
    this.socket = socket;

    this.socket.on('error', this.onSocketError);
    this.socket.on('disconnect', this.onSocketDisconnect);

    this.on(MessageType.ERROR, (data) => {
      const errorMsg = JSON.stringify(data, null, 4);
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        this.logger.console.warn(`${this.logger.getName()} error message: \n${errorMsg}`);
      }
    });
  }

  destroy() {
    super.destroy();
    if (this.onMessageCancel) {
      this.onMessageCancel();
      this.onMessageCancel = undefined;
    }
    // removed because of duplication of cancel-query request SNS-37819
    // this.cancelQuery();
    this.socket.off('error', this.onSocketError);
    this.socket.off('disconnect', this.onSocketDisconnect);
  }

  /**
   * Return copy of load service
   *
   * @returns {DataLoadService} - cloned instance
   */
  clone(): DataLoadServiceI {
    const data = cloneObject(this.data);
    // restore empty headers object
    if (!data[MessageType.HEADERS]) {
      data[MessageType.HEADERS] = [{}];
    }
    const instance = new DataLoadService(this.socket);
    instance.data = data;
    instance.jaql = this.jaql;
    instance.isFinishEventReceived = this.isFinishEventReceived;
    instance.isSingleBranchTree = this.isSingleBranchTree;
    instance.loadedItemsCount = this.loadedItemsCount;
    instance.totalItemsCount = this.totalItemsCount;
    instance.isLimited = this.isLimited;
    return instance;
  }

  /**
   * Start data loading from the server
   *
   * @returns {void}
   * @private
   */
  loadFromServer() {
    // eslint-disable-next-line promise/catch-or-return
    this.waitForSocketReady().then(() => {
      if (this.onMessageCancel) {
        this.onMessageCancel();
      }

      this.onMessageCancel = this.socket.onMessage(undefined, undefined, (type, data) => {
        this.logger.log('handleMessage', type, data);
        this.notifyAboutDataChunk(type, data);
      });

      this.socket.send('pivot', this.jaql);
    });
  }

  /**
   * Method for canceling the processing of query already sent
   *
   * @returns {Promise<void>} - waiting promise
   */
  cancelQuery(): Promise<void> {
    if (!this.isCancelQueryNeeded()) {
      return Promise.resolve();
    }
    return this.waitForSocketReady().then(() => {
      this.socket.send('pivot/cancel-query', {
        // eslint-disable-next-line promise/always-return
        queryGuid: this.jaql && this.jaql.queryGuid,
      });
    });
  }

  /**
   *  Wait for socket connection
   *
   * @returns {Promise<void>} - wait promise
   * @private
   */
  waitForSocketReady(): Promise<void> {
    if (this.socket.isReady()) {
      return Promise.resolve();
    }
    if (this.isInitInProgress && this.initPromise) {
      return this.initPromise;
    }
    this.isInitInProgress = true;
    this.initPromise = new Promise((resolve, reject) => {
      this.socket.on('open', () => {
        if (this.socket && this.socket.isReady()) {
          resolve();
        } else {
          reject(new Error('Can not open WebSocket connection'));
        }
      });
    });
    return this.initPromise;
  }

  onSocketError = (error: Error) => {
    this.emit('error', {
      error: true,
      type: 500,
      details: `Socket error: ${error.message}`,
    });
  };

  onSocketDisconnect = () => {
    this.emit('error', {
      error: true,
      type: 500,
      details: 'Socket disconnected',
    });
  };
}

export default DataLoadService;
