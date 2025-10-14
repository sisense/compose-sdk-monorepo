/* eslint-disable class-methods-use-this */
import EventEmitter from 'events';

import { debug } from '../utils/index.js';
import { LoggerI } from '../utils/types.js';
import { DataLoadServiceI, JaqlRequest } from './types.js';

export class TestDataLoadService implements DataLoadServiceI {
  logger: LoggerI;

  events: EventEmitter;

  data?: JaqlRequest;

  delegatedLoadService?: DataLoadServiceI = undefined;

  constructor(url: string, events?: EventEmitter) {
    this.logger = debug.create('TestDataLoadService');
    this.events = events || new EventEmitter();
  }

  destroy() {
    this.data = undefined;
  }

  clone(): DataLoadServiceI {
    const instanceName = this.logger.getName();
    throw new Error(`"${instanceName}.clone" should not be called`);
  }

  load(jaql: JaqlRequest): Promise<any> {
    this.data = jaql;
    return Promise.resolve(null);
  }

  cancelQuery(): Promise<void> {
    return Promise.resolve();
  }

  clear(): void {
    this.data = undefined;
  }

  getJaql(): JaqlRequest | undefined {
    return this.data;
  }

  isSingleRowTree(): boolean {
    return !this.data;
  }

  getTotalItemsCount(): number {
    return this && 0;
  }

  delegate(loadService: DataLoadServiceI) {
    this.delegatedLoadService = loadService;
  }

  on(eventName: string, callback: (payload: any) => void): void {
    this.events.on(eventName, callback);
  }

  off(eventName: string, callback: (payload: any) => void): void {
    this.events.removeListener(eventName, callback);
  }

  offAll(eventName: string): void {
    this.events.removeAllListeners(eventName);
  }

  listenerCount(eventName: string): number {
    return this.events.listenerCount(eventName);
  }

  emit(eventName: string, ...rest: Array<any>): void {
    this.events.emit(eventName, ...rest);
  }

  isFormattingChanges(jaql?: JaqlRequest): boolean {
    return jaql ? true : !!this;
  }

  // applyFormattingChanges(jaql?: JaqlRequest): Promise<DataLoadServiceI> {
  //   const res = jaql ? this : this;
  //   return Promise.resolve(res);
  // }
  //
  // checkSorting(): Promise<void> {
  //   return this && Promise.resolve();
  // }

  hasData(): boolean {
    return this && true;
  }

  hasError(): boolean {
    return this && false;
  }
}

export default TestDataLoadService;
