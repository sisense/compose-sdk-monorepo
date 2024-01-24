/* eslint-disable @typescript-eslint/ban-types */
import EventEmitter from 'events';
import { v4 as uuid } from 'uuid';
import { DataLoadService } from './DataLoadService.js';
import { MessageType } from './constants.js';
import { debug } from '../utils/index.js';
import { DataLoadServiceI, SocketI } from './types.js';

type Options = {
  socketRegisterCheckInterval?: number;
};

/**
 * Initiate single socket connection and creates new PivotDataSource for each JAQL request
 */
export class SisenseDataLoadService extends DataLoadService implements DataLoadServiceI {
  /**
   * @private
   */
  options: Options;

  /**
   * @private
   */
  registrationWaitTimer?: NodeJS.Timeout;

  /**
   * @private
   *
   * onMessage remove listeners callback
   */
  onMessageCancels: Array<Function | undefined> = [];

  constructor(socket?: SocketI, events?: EventEmitter, options: Options = {}) {
    super(socket, events);
    this.options = options;
    this.logger = debug.create('SisenseDataLoadService');
  }

  destroy() {
    super.destroy();
    if (this.onMessageCancels.length) {
      this.onMessageCancels.forEach((onMessageCancel) => {
        if (onMessageCancel) {
          onMessageCancel();
        }
      });
      this.onMessageCancels.length = 0;
    }
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
      const queryJaql = {
        queryGuid: uuid(),
        ...this.jaql,
      };
      const { queryGuid } = queryJaql;

      if (this.onMessageCancels.length) {
        this.onMessageCancels.forEach((onMessageCancel) => {
          if (onMessageCancel) {
            onMessageCancel();
          }
        });
        this.onMessageCancels.length = 0;
      }

      Object.values(MessageType).forEach((mType) => {
        // TODO: misnomer??? It should be onMessageHandle
        const onMessageCancel = this.socket.onMessage(mType, queryGuid, (type, data) => {
          this.logger.log('handleMessage', type, data);
          this.notifyAboutDataChunk(type, data);
        });
        this.onMessageCancels.push(onMessageCancel);
      });
      this.socket.send('pivot', queryJaql);
    });
  }

  /**
   * Wait for socket connection and registration
   *
   * @returns {Promise<*>} - wait promise
   * @private
   */
  waitForSocketReady(): Promise<any> {
    if (this.socket.isReady()) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const { socketRegisterCheckInterval = 100 } = this.options;
      if (this.registrationWaitTimer) {
        clearInterval(this.registrationWaitTimer);
      }

      const checkSocketReady = () => {
        if (this.socket.isReady()) {
          clearInterval(this.registrationWaitTimer);
          resolve();
        }
      };

      this.registrationWaitTimer = setInterval(checkSocketReady, socketRegisterCheckInterval);
    });
  }
}

export default SisenseDataLoadService;
