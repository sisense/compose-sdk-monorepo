/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-useless-escape */
import { Element } from './interfaces.js';

/**
 * @internal
 */
export abstract class DimensionalElement implements Element {
  constructor(name: string, type: string, desc?: string) {
    this.name = name;
    this.type = type;
    this.description = desc || '';
  }

  /**
   * Defines the element's name
   */
  name: string;

  /**
   * gets the element's description
   */
  readonly description: string;

  /**
   * gets the element's type
   */
  readonly type: string;

  /**
   * gets the element's ID
   */
  abstract get id(): string;

  /**
   * Gets a serializable representation of the element
   */
  serializable(): any {
    return {
      name: this.name,
      type: this.type,
      desc: this.description,
      __serializable: 'DimensionalElement',
    };
  }

  toJSON(): any {
    return this.serializable();
  }

  abstract jaql(nested?: boolean): any;

  /**
   * Gets a string representation of the element
   */
  toString(): string {
    return this.jaql();
  }
}

/**
 * @param name
 * @internal
 */
export function normalizeName(name: string): string {
  return name.replace(/[\/\\!#,+()$~%.'":*?<>{}\-` \[\]]/g, '');
}
