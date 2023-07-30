/* eslint-disable max-params */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Attribute, LevelAttribute } from './interfaces.js';

import { Sort, MetadataTypes, DateLevels } from './types.js';

import { DimensionalElement, normalizeName } from './base.js';

/**
 * @internal
 */
export class DimensionalAttribute extends DimensionalElement implements Attribute {
  readonly expression: string;

  protected _sort: Sort = Sort.None;

  constructor(name: string, expression: string, type?: string, desc?: string, sort?: Sort) {
    super(normalizeName(name), type || MetadataTypes.Attribute, desc);

    this.expression = expression;
    this._sort = sort || Sort.None;
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return this.expression;
  }

  /**
   * Gets the sort definition of this instance
   *
   * @returns The Sort definition of this instance
   */
  getSort(): Sort {
    return this._sort;
  }

  /**
   * Gets a sorted {@link Attribute} with the given definition
   *
   * @param sort - Sort definition
   * @returns An instance representing the sorted {@link Attribute} of this instance
   */
  sort(sort: Sort): Attribute {
    return new DimensionalAttribute(this.name, this.expression, this.type, this.description, sort);
  }

  /**
   * Gets the JAQL representation of this instance
   *
   * @param nested - defines whether the JAQL is nested within parent JAQL statement or a root JAQL element
   */
  jaql(nested?: boolean): any {
    const result = <any>{
      jaql: {
        title: this.name,
        dim: this.expression,
      },
    };

    if (this._sort != Sort.None) {
      result.jaql.sort = this._sort == Sort.Ascending ? 'asc' : 'desc';
    }

    return nested === true ? result.jaql : result;
  }

  /**
   * Gets a serializable representation of the element
   */
  serializable(): any {
    const result = super.serializable();

    result.expression = this.expression;

    if (this.getSort() !== Sort.None) {
      result.sort = this.getSort().toString();
    }

    return result;
  }
}

/**
 * @internal
 */
export class DimensionalLevelAttribute extends DimensionalAttribute implements LevelAttribute {
  private _format: string | undefined;

  readonly granularity: string;

  constructor(
    l: string,
    expression: string,
    granularity: string,
    format?: string,
    desc?: string,
    sort?: Sort,
  ) {
    super(l, expression, MetadataTypes.DateLevel, desc, sort);

    this._format = format;
    this.granularity = granularity;
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    let id = `${this.expression}`;
    const { level = '', dateTimeLevel = '', bucket } = this.translateGranularityToJaql();

    id += `_${(level || dateTimeLevel).toLowerCase()}`;

    if (bucket) {
      id += `_${bucket}`;
    }

    return id;
  }

  /**
   * Gets the sort definition of this instance
   *
   * @returns The Sort definition of this instance
   */
  getSort(): Sort {
    return this._sort;
  }

  /**
   * Gets a sorted {@link LevelAttribute} with the given definition
   *
   * @param sort - Sort definition
   * @returns An instance representing the sorted {@link LevelAttribute} of this instance
   */
  sort(sort: Sort): Attribute {
    return new DimensionalLevelAttribute(
      this.name,
      this.expression,
      this.granularity,
      this._format,
      this.description,
      sort,
    );
  }

  /**
   * The string formatting of this instance
   *
   * @returns string formatting
   */
  getFormat(): string | undefined {
    return this._format;
  }

  /**
   * Gets a formatted {@link LevelAttribute} with the given definition
   *
   * @param format - Format string
   * @returns An instance representing the formatted {@link LevelAttribute} of this instance
   */
  format(format: string): LevelAttribute {
    return new DimensionalLevelAttribute(
      this.name,
      this.expression,
      this.granularity,
      format,
      this.description,
      this._sort,
    );
  }

  /**
   * Gets a serializable representation of the element
   */
  serializable(): any {
    const result = super.serializable();

    result.granularity = this.granularity;

    if (this.getFormat() !== undefined) {
      result.format = this.getFormat();
    }

    return result;
  }

  /**
   * Gets the JAQL representation of this instance
   *
   * @param nested - defines whether the JAQL is nested within parent JAQL statement or a root JAQL element
   */
  jaql(nested?: boolean): any {
    const r = <any>{
      jaql: {
        title: this.name,
        dim: this.expression,
        ...this.translateGranularityToJaql(),
      },
    };

    if (this._format !== undefined) {
      const levelName = r.jaql.dateTimeLevel || r.jaql.level;
      r.format = { mask: {} };
      r.format.mask[levelName] = this._format;
    }

    if (this._sort != Sort.None) {
      r.jaql.sort = this._sort == Sort.Ascending ? 'asc' : 'desc';
    }

    return nested === true ? r.jaql : r;
  }

  /**
   * Obtain the JAQL representation of the level that depends on the granularity
   */
  translateGranularityToJaql() {
    const MINUTES_LEVEL = 'minutes';
    switch (this.granularity) {
      case DateLevels.Years:
      case DateLevels.Quarters:
      case DateLevels.Months:
      case DateLevels.Weeks:
      case DateLevels.Days:
        return { level: this.granularity.toLowerCase() };
      case DateLevels.Hours:
        return {
          dateTimeLevel: MINUTES_LEVEL,
          bucket: '60',
        };
      case DateLevels.MinutesRoundTo30:
        return {
          dateTimeLevel: MINUTES_LEVEL,
          bucket: '30',
        };
      case DateLevels.MinutesRoundTo15:
        return {
          dateTimeLevel: MINUTES_LEVEL,
          bucket: '15',
        };
      case DateLevels.AggHours:
        return {
          level: MINUTES_LEVEL,
          bucket: '60',
        };
      case DateLevels.AggMinutesRoundTo30:
        return {
          level: MINUTES_LEVEL,
          bucket: '30',
        };
      case DateLevels.AggMinutesRoundTo15:
        return {
          level: MINUTES_LEVEL,
          bucket: '15',
        };
      case DateLevels.AggMinutesRoundTo1:
        return {
          level: MINUTES_LEVEL,
          bucket: '1',
        };
      default:
        console.warn('Unsupported level');
        return { level: this.granularity };
    }
  }
}

/**
 * Creates an Attribute instance from the given JSON object.
 * If the JSON object contains a granularity property, a {@link LevelAttribute} instance is created.
 *
 * This function is used in the generated data model code to create dimension attributes from an input data source.
 *
 * See also functions {@link createDimension} and {@link createDateDimension}.
 *
 * @param json - JSON object representing the attribute
 * @returns An Attribute instance
 */
export function createAttribute(json: any): Attribute {
  if (json.granularity) {
    return createLevel(json);
  }

  return new DimensionalAttribute(
    json.name || json.title,
    json.attribute || json.expression || json.dim,
    json.type || json.desc || json.description,
  );
}

/**
 * @param json
 * @internal
 */
export function createLevel(json: any): LevelAttribute {
  return new DimensionalLevelAttribute(
    json.name || json.title,
    json.attribute || json.expression || json.dim,
    json.granularity,
    json.format,
    json.desc || json.description,
  );
}
