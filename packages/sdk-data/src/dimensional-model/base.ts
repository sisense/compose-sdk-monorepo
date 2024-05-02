/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-useless-escape */
import { Element } from './interfaces.js';

/**
 * @internal
 */
export abstract class DimensionalElement implements Element {
  /**
   * @internal
   */
  private _name: string;

  /**
   * Defines the element's name
   */
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  constructor(name: string, type: string, desc?: string) {
    this._name = name;
    this.type = type;
    this.description = desc || '';
  }

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
  // Remove all invalid characters
  let normalizedName = name.replace(/[^a-zA-Z0-9_]/g, '');

  // Prefix with '_' if it starts with a number
  const firstChar = normalizedName.charAt(0);
  if (firstChar.match(/[0-9]/)) {
    normalizedName = '_' + normalizedName;
  }

  return normalizedName;
}
