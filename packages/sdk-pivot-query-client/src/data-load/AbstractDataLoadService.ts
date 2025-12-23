/* eslint-disable @typescript-eslint/ban-types */
import EventEmitter from 'events';

import { PanelType } from '../data-handling/constants.js';
import { cloneObject } from '../utils/index.js';
import { MESSAGES_ORDER, MessageType } from './constants.js';
import { DataLoadServiceI, JaqlRequest } from './types.js';

const formattingProps = {
  INCLUDE: [
    'metadata.$.jaql',
    'metadata.$.field',
    'metadata.$.panel',
    'metadata.$.hierarchies',
    'metadata.$.format',
    'metadata.$.disabled',
    'metadata.$.distinctTotals',
  ],
  EXCLUDE: [
    'metadata.$.jaql.title',
    'metadata.$.format.mask',
    'metadata.$.format.width',
    'queryGuid',
    'widget',
    'dashboard',
    'grandTotals.title',
  ],
};

type DataCache = {
  [key: string]: any;
};

type LoadState = {
  [key: string]: number;
};

/**
 * Initiate single socket connection and creates new PivotDataSource for each JAQL request
 */
export class AbstractDataLoadService implements DataLoadServiceI {
  /**
   *
   * @private
   *
   * EventEmitter instance
   */
  events: EventEmitter;

  /**
   * @private
   *
   * jaql request object
   */
  jaql?: JaqlRequest = undefined;

  /**
   * @private
   *
   * cache object
   */
  data?: DataCache = undefined;

  /**
   * @private
   *
   * state for "load" method
   */
  isLoadInProgress = false;

  /**
    @private */
  loadPromiseResolve?: Function = undefined;

  /**
   *
   * @private
   */
  loadPromiseReject?: Function = undefined;

  /**
   * @private
   *
   * info about amount of data which already loaded from cache
   */
  loadFromCacheState?: LoadState = undefined;

  /**
    @private */
  loadFromCacheInitialTimer?: NodeJS.Timeout = undefined;

  /**
    @private */
  loadFromCacheTimer?: NodeJS.Immediate = undefined;

  /**
   * @private
   *
   * defines initial pivot data structure
   */
  isSingleBranchTree = false;

  /**
   * @private
   *
   * items count loaded on client side
   */
  loadedItemsCount = 0;

  /**
   * @private
   *
   * total items count on back-end side
   */
  totalItemsCount = 0;

  /**
   * @private
   *
   * defines if amount of data was limited on back-end or not
   */
  isLimited = false;

  /**
   * @private
   *
   * detects if finish event was received
   */
  isFinishEventReceived = false;

  constructor(events?: EventEmitter) {
    this.events = events || new EventEmitter();
  }

  /**
   * Destroys data load service
   *
   * @returns {void}
   */
  destroy() {
    this.data = undefined;
    this.events.removeAllListeners();
  }

  /**
   * Return copy of load service
   *
   * @returns {DataLoadService} - cloned instance
   */
  clone(): DataLoadServiceI {
    throw new Error(`"AbstractDataLoadService.clone" should be overridden in subclass`);
  }

  /**
   * Start data loading according to JAQL request
   *
   * @param {JaqlRequest} jaql - JAQL request
   * @returns {Promise<any>} - whole data loading promise
   */
  load(jaql: JaqlRequest): Promise<any> {
    if (!jaql) {
      throw new Error(`AbstractDataLoadService "jaql" is not defined for "load" method`);
    }

    const shouldLoadFromCache = !!this.data;
    const prevJaql = this.jaql;

    this.jaql = jaql;
    if (shouldLoadFromCache && prevJaql) {
      // do not overwrite jaql queryGuid if data will be loaded from cache
      // needed for sending cancel-query request with proper jaql queryGuid
      this.jaql.queryGuid = prevJaql.queryGuid;
    }

    this.isLoadInProgress = true;
    const loadPromise = new Promise((resolve, reject) => {
      this.loadPromiseResolve = resolve;
      this.loadPromiseReject = reject;
    });

    if (this.loadFromCacheInitialTimer) {
      clearTimeout(this.loadFromCacheInitialTimer);
    }

    try {
      if (shouldLoadFromCache) {
        this.loadFromCache();
      } else {
        this.loadFromServer();
      }
    } catch (err) {
      this.notifyAboutDataError(err);
    }

    return loadPromise;
  }

  /**
   * Clear data cache
   *
   * @returns {void}
   */
  clear(): void {
    this.data = undefined;
  }

  /**
   * Returns current jaql request object
   *
   * @returns {JaqlRequest} - jaql request object
   */
  getJaql(): JaqlRequest | undefined {
    return this.jaql;
  }

  /**
   * Defines data structure
   *
   * @returns {boolean} - true - single branch tree
   */
  isSingleRowTree(): boolean {
    return this.isSingleBranchTree;
  }

  /**
   * Returns total amount items count handled on back-end side
   *
   * @returns {number} - items count
   */
  getTotalItemsCount(): number {
    return this.totalItemsCount;
  }

  /**
   * Defines if new jaql has only formatting changes or it requires new data loading from server
   *
   * @param {JaqlRequest} jaql - jaql request object
   * @returns {boolean} - true - only formatting changes, can use cached data
   */
  isFormattingChanges(jaql?: JaqlRequest): boolean {
    const currentFormatInfo = cloneObject(this.jaql, {
      include: formattingProps.INCLUDE,
      exclude: formattingProps.EXCLUDE,
      excludeEmpty: true,
    });
    const newFormatInfo = cloneObject(jaql, {
      include: formattingProps.INCLUDE,
      exclude: formattingProps.EXCLUDE,
      excludeEmpty: true,
    });

    [...(currentFormatInfo?.metadata || []), ...(newFormatInfo?.metadata || [])].forEach(
      (panelItem) => {
        if (panelItem && panelItem.panel === PanelType.SCOPE) {
          delete panelItem.field;
        }
      },
    );

    return JSON.stringify(currentFormatInfo) === JSON.stringify(newFormatInfo);
  }

  /**
   * Defines if service have some data
   *
   * @returns {boolean} - true - has some data
   */
  hasData(): boolean {
    return !!(this.data && this.data[MessageType.DATA]);
  }

  /**
   * Defines if service have some error
   *
   * @returns {boolean} - true - has some error
   */
  hasError(): boolean {
    if (this.data) {
      return !!this.data[MessageType.ERROR];
    }
    return false;
  }

  /**
   * Start data loading from the server
   *
   * @returns {void}
   * @private
   */
  loadFromServer() {
    throw new Error(`"AbstractDataLoadService.loadFromServer" should be overridden in subclass`);
  }

  /**
   * Method for canceling the processing of query already sent
   *
   * @returns {Promise<void>} - waiting promise
   */
  cancelQuery(): Promise<void> {
    const error = new Error(
      `"AbstractDataLoadService.cancelQuery" should be overridden in subclass.`,
    );
    return Promise.reject(error);
  }

  /**
   * Method for detection if cancel query is still needed
   *
   * @returns {boolean} - is cancel query needed
   */
  isCancelQueryNeeded(): boolean {
    return !this.isFinishEventReceived;
  }

  /**
   * Start data loading from the cache
   *
   * @returns {Promise<void>} - waiting promise
   * @private
   */
  loadFromCache(): Promise<void> {
    return Promise.resolve()
      .then(() => {
        if (this.loadFromCacheInitialTimer) {
          clearTimeout(this.loadFromCacheInitialTimer);
        }
        return new Promise((resolve) => {
          this.loadFromCacheInitialTimer = setTimeout(resolve);
          // eslint-disable-next-line max-lines
        });
      })
      .then(
        () =>
          new Promise((resolve) => {
            if (this.loadFromCacheTimer) {
              clearImmediate(this.loadFromCacheTimer);
            }
            this.loadFromCacheState = undefined;
            this.loadMessageFromCache(() => {
              this.loadFromCacheState = undefined;
              if (this.loadFromCacheTimer) {
                clearImmediate(this.loadFromCacheTimer);
              }
              resolve();
            });
          }),
      );
  }

  /**
   * Starts loading data from cache queue
   *
   * @param {Function} onFinish - on finish callback
   * @returns {void}
   * @private
   */
  loadMessageFromCache(onFinish: () => void): void {
    // Note: removed `setImmediate` as not supported
    this.loadFromCacheState = this.loadFromCacheState || {};
    const state = this.loadFromCacheState;
    let typeToSend = '';
    let indexToSend = 0;
    MESSAGES_ORDER.forEach((type) => {
      if (typeToSend) {
        return;
      }
      state[type] = state[type] || 0;
      const loadedCount = state[type];
      if (loadedCount < ((this.data || {})[type] || []).length) {
        typeToSend = type;
        indexToSend = state[type];
      }
    });

    if (typeToSend) {
      const payload = ((this.data || {})[typeToSend] || [])[indexToSend];
      this.notifyAboutDataChunk(typeToSend || '', payload, true);
      state[typeToSend] = indexToSend + 1;
      this.loadMessageFromCache(onFinish);
    } else if (onFinish) {
      onFinish();
    }
  }

  /**
   * Cache appropriate message
   *
   * @param {string} type - message type
   * @param {any} data - message payload
   * @returns {void}
   * @private
   */
  cacheData(type: string, data?: any): void {
    this.data = this.data || {};
    const cache = this.data;
    if (!cache) {
      return;
    }

    cache[type] = cache[type] || [];
    cache[type].push(data || true);
  }

  /*
   *
   * @private
   */

  /**
   * Notify outside about data chunk with saving to inner cache, applying chunk formatting with
   * saving initial messages queue
   *
   * @param {string} type - data chunk type
   * @param {any} chunk - data chunk data
   * @param {boolean} isFromCache - mark data which already was cached
   * @returns {void}
   * @private
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  notifyAboutDataChunk(type: string, chunk?: any, isFromCache = false) {
    // console.log('notifyAboutDataChunk', type, chunk, isFromCache);
    const data = chunk && chunk.data && type === MessageType.DATA ? chunk.data : chunk;

    if (!isFromCache) {
      this.cacheData(type, chunk);
    }
    if (!isFromCache && this.loadFromCacheState) {
      // if load original data but new loading from cache started
      return;
    }

    if (type === MessageType.METADATA) {
      this.isSingleBranchTree = !!(data && data.isSingleBranchTree);
    }

    if (type === MessageType.ERROR) {
      this.notifyAboutDataError(data);
    }

    if (type === MessageType.DATA_FINISH) {
      this.loadedItemsCount = data ? data.rowsCount : 0;
      this.notifyAboutDataLoaded(this.data);
    }

    if (type === MessageType.TOTAL_ROWS) {
      this.totalItemsCount = data ? data.rowsCount : 0;
      if (this.totalItemsCount !== this.loadedItemsCount) {
        this.isLimited = true;
      }
    }

    if (type === MessageType.FINISH) {
      this.isFinishEventReceived = true;
    }

    const clonedData = cloneObject(data);
    this.events.emit(type, clonedData);
  }

  /**
   * Resolve "load" method with appropriate data information
   *
   * @param {any} data - data to resolve with
   * @returns {void}
   * @private
   */
  notifyAboutDataLoaded(data?: any) {
    if (!this.isLoadInProgress) {
      return;
    }
    this.isLoadInProgress = false;
    if (typeof this.loadPromiseResolve === 'function') {
      this.loadPromiseResolve(data);
    }
    this.loadPromiseReject = undefined;
    this.loadPromiseResolve = undefined;
  }

  /**
   * Reject "load" method with appropriate data information
   *
   * @param {any} data - data to reject with
   * @returns {void}
   * @private
   */
  notifyAboutDataError(data?: any) {
    if (!this.isLoadInProgress) {
      return;
    }
    this.isLoadInProgress = false;
    if (typeof this.loadPromiseReject === 'function') {
      this.loadPromiseReject(data);
    }
    this.loadPromiseReject = undefined;
    this.loadPromiseResolve = undefined;
  }

  /**
   * Subscribe to event notification
   *
   * @param {string} eventName - event name to subscribe
   * @param {Function} callback - event handler
   * @returns {void}
   */
  on(eventName: string, callback: (payload: any) => void): void {
    this.events.on(eventName, callback);
  }

  /**
   * Unsubscribe from event notification
   *
   * @param {string} eventName - event name to unsubscribe
   * @param {Function} callback - event handler
   * @returns {void}
   */
  off(eventName: string, callback: (payload: any) => void): void {
    this.events.removeListener(eventName, callback);
  }

  /**
   * Unsubscribe from all event notifications
   *
   * @param {string} eventName - event name to unsubscribe
   * @returns {void}
   */
  offAll(eventName: string): void {
    this.events.removeAllListeners(eventName);
  }

  listenerCount(eventName: string): number {
    return this.events.listenerCount(eventName);
  }

  /**
   * Trigger event notification
   *
   * @param {string} eventName - event name to subscribe
   * @param {Array<any>} rest - arguments will be passed to event handler
   * @returns {void}
   */
  emit(eventName: string, ...rest: Array<any>): void {
    this.events.emit(eventName, ...rest);
  }
}

export default AbstractDataLoadService;
