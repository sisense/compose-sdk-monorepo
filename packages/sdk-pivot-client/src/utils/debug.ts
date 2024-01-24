/* eslint-disable @typescript-eslint/ban-types */
import { LoggerI, Console } from './types.js';

const excludedNames = ['S&PManager', 'Cache'];
const includedNames = ['null'];

export class Logger implements LoggerI {
  name: string;

  log: Function;

  warn: Function;

  error: Function;

  console: Console;

  constructor(name = '') {
    this.name = name;
    this.log = () => {};
    this.warn = () => {};
    this.error = () => {};
    // this.console = (typeof window !== 'undefined')
    //     ? window.console
    //     : Logger.createMockConsole();
    this.console = Logger.createMockConsole();
    this.createLogFn();
  }

  setName(name: string): void {
    this.name = name;
    this.createLogFn();
  }

  getName(): string {
    return this.name;
  }

  /**
   * Creates real or fake "log" function depending on include/exclude rules
   *
   * @returns {void}
   * @private
   */
  createLogFn() {
    // if (process.env.NODE_ENV === 'production' || this.isExcludedName()) {
    this.log = () => {};
    this.warn = () => {};
    this.error = () => {};
    // } else {
    //   // eslint-disable-next-line no-console
    //   this.log = console.log.bind(window.console, this.name);
    //   // eslint-disable-next-line no-console
    //   this.warn = console.warn.bind(window.console, this.name);
    //   // eslint-disable-next-line no-console
    //   this.error = console.error.bind(window.console, this.name);
    // }
  }

  /**
   * Defines if logger is excluded from logging
   *
   * @returns {boolean} - true - excluded
   * @private
   */
  isExcludedName() {
    if (includedNames.length && !this.hasNamePartsInList(includedNames)) {
      return true;
    }
    if (!excludedNames.length) {
      return false;
    }
    return this.hasNamePartsInList(excludedNames);
  }

  /**
   * Determinates if included/excluded items contains part of the name
   *
   * @param {Array<string>} array - included/excluded items
   * @returns {boolean} - true - contains
   * @private
   */
  hasNamePartsInList(array: Array<string>) {
    const nameLower = this.name.toLowerCase();
    return array.some((item) => {
      return nameLower.includes(item.toLowerCase());
    });
  }

  /**
   * Creates mock console instance for tests
   *
   * @returns {LoggerI} - logger instance
   */
  static createMockConsole(): Console {
    return {
      log: () => {},
      warn: () => {},
      error: () => {},
    };
  }

  /**
   * Creates mock instance for tests
   *
   * @returns {LoggerI} - logger instance
   */
  static createMock(): LoggerI {
    const console = Logger.createMockConsole();
    return {
      setName: () => {},
      getName: () => '',
      ...console,
      console,
    };
  }
}

export const create = (namespace: string): LoggerI => new Logger(namespace);

export const excludeLogs = (name = ''): void => {
  excludedNames.push(name.toLowerCase());
};

export const includeLogs = (name = ''): void => {
  includedNames.push(name.toLowerCase());
};

export const clearIncludeExclude = (): void => {
  excludedNames.length = 0;
  includedNames.length = 0;
};

export default {
  Logger,
  create,
  excludeLogs,
  includeLogs,
  clearIncludeExclude,
};

// if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
//   // eslint-disable-next-line no-underscore-dangle
//   (window as any).__excludeLogs = excludeLogs;
//   // eslint-disable-next-line no-underscore-dangle
//   (window as any).__includeLogs = includeLogs;
//   // eslint-disable-next-line no-underscore-dangle
//   (window as any).__clearIncludeExclude = clearIncludeExclude;
// }
