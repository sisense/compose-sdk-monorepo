/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable no-useless-escape */
import { Element } from './interfaces.js';
import { JaqlDataSource, JSONObject } from './types.js';

/**
 * @internal
 */
export abstract class DimensionalElement implements Element {
  /**
   * @internal
   */
  readonly __serializable: string = 'DimensionalElement';

  /**
   * @internal
   */
  private _name: string;

  /**
   * @internal
   */
  private _title: string;

  /**
   * @internal
   */
  private readonly _dataSource: JaqlDataSource;

  /**
   * Defines the element's name
   */
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  /**
   * Gets the element's title
   * @internal
   */
  get title(): string {
    return this._title;
  }

  /**
   * Sets the element's title
   * @internal
   */
  set title(value: string) {
    this._title = value;
  }

  /**
   * Defines the element's data source
   */
  get dataSource(): JaqlDataSource {
    return this._dataSource;
  }

  constructor(
    name: string,
    type: string,
    desc?: string,
    dataSource?: JaqlDataSource,
    composeCode?: string,
  ) {
    this._name = name;
    // default title to name to retain the original name in the data model
    this._title = name;
    this.type = type;
    this.description = desc || '';

    if (dataSource) {
      this._dataSource = dataSource;
    }

    if (composeCode) {
      this.composeCode = composeCode;
    }
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
   * Optional CSDK code to initialize this element
   *
   * @internal
   */
  composeCode?: string;

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    return {
      name: this.name,
      type: this.type,
      description: this.description,
      dataSource: this.dataSource,
      composeCode: this.composeCode,
      __serializable: this.__serializable,
    };
  }

  toJSON(): JSONObject {
    return this.serialize();
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
 * @param name - The name to normalize
 * @internal
 */
export function normalizeName(name: string): string {
  // Remove all invalid characters
  let normalizedName = name.replace(/[^a-zA-Z0-9_.]/g, '').replace(/\./g, '_');

  // Prefix with '_' if it starts with a number
  const firstChar = normalizedName.charAt(0);
  if (firstChar.match(/[0-9]/)) {
    normalizedName = '_' + normalizedName;
  }

  return normalizedName;
}

/**
 * Checks if a name contains characters that would be modified by normalizeName().
 * Includes: spaces, special chars (!@#$%^&*), dots, brackets, or starts with number.
 *
 * @example
 * needsNormalization("Age Range")  // true (space)
 * needsNormalization("Cost ($)")   // true (special chars)
 * needsNormalization("Rev.2024")   // true (dot)
 * needsNormalization("2024Data")   // true (starts with number)
 * needsNormalization("Revenue")    // false
 *
 * @param name - The name to check
 * @returns true if the name would be modified by normalizeName()
 * @internal
 */
export function needsNormalization(name: string): boolean {
  // Check for invalid characters (anything not a-zA-Z0-9_)
  // Note: dots are also "invalid" as they get replaced with underscores
  // Check if starts with a number (gets prefixed with _)
  return /[^a-zA-Z0-9_]/.test(name) || /^[0-9]/.test(name);
}

/**
 * Wraps name in [[delimiters]] if it would be modified by normalizeName().
 * Used to preserve original names in composeCode while marking them for transformation.
 *
 * @example
 * wrapIfNeedsNormalization("Age Range")  // "[[Age Range]]"
 * wrapIfNeedsNormalization("Revenue")    // "Revenue" (unchanged)
 *
 * @param name - The name to potentially wrap
 * @returns The name wrapped in [[]] if it needs normalization, otherwise unchanged
 * @internal
 */
export function wrapIfNeedsNormalization(name: string): string {
  return needsNormalization(name) ? `[[${name}]]` : name;
}
