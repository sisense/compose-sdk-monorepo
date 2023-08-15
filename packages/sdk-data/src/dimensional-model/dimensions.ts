/* eslint-disable max-params */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Attribute, LevelAttribute, Dimension, DateDimension } from './interfaces.js';

import { Sort, DateLevels, MetadataTypes } from './types.js';

import {
  DimensionalAttribute,
  DimensionalLevelAttribute,
  jaqlSimpleColumnType,
} from './attributes.js';

import { DimensionalElement, normalizeName } from './base.js';

/**
 * Represents a Dimension in a Dimensional Model
 *
 * @internal
 */
export class DimensionalDimension extends DimensionalElement implements Dimension, Attribute {
  static parseType(type: string): string {
    switch (type) {
      case 'datetime':
      case MetadataTypes.DateDimension:
        return MetadataTypes.DateDimension;

      case 'text':
      case MetadataTypes.TextDimension:
        return MetadataTypes.TextDimension;

      case 'numeric':
      case MetadataTypes.NumericDimension:
        return MetadataTypes.NumericDimension;
    }

    return MetadataTypes.TextDimension;
  }

  [propName: string]: any;

  defaultAttribute: Attribute | undefined;

  protected _dimensions: Dimension[] = [];

  protected _attributes: Attribute[] = [];

  private _expression: string;

  protected _sort: Sort = Sort.None;

  constructor(
    name: string,
    expression: string,
    attributes: Attribute[],
    dimensions?: Dimension[],
    type?: string,
    desc?: string,
    sort?: Sort,
  ) {
    super(name, type || MetadataTypes.Dimension, desc);

    this._sort = sort || Sort.None;
    this._expression = expression;
    this.setDimensions(dimensions || []);
    this.setAttributes(attributes);
  }

  private getAttachedName(name: string, expression: string): string {
    let result = normalizeName(name);

    // if exists fallback to expression
    if (
      result === 'id' ||
      result === 'name' ||
      Object.getOwnPropertyDescriptor(this, result) !== undefined ||
      this[result] !== undefined
    ) {
      result = normalizeName(expression.replace('.', '_').replace('[', '').replace(']', ''));
    }

    return result;
  }

  protected setDimensions(dimensions: Dimension[]) {
    this._dimensions = dimensions;

    for (let i = 0; i < dimensions.length; i++) {
      const n = this.getAttachedName(dimensions[i].name, dimensions[i].attributes[0].expression);

      this[n] = dimensions[i];

      if (n != dimensions[i].name) {
        dimensions[i].name = n;
      }
    }
  }

  protected setAttributes(attributes: Attribute[]) {
    this._attributes = attributes || [];

    for (let i = 0; i < attributes.length; i++) {
      const n = this.getAttachedName(attributes[i].name, attributes[i].expression);

      this[n] = attributes[i];

      if (attributes[i].name != n) {
        attributes[i].name = n;
      }

      // attaching to dimension
      //this.attributes[i].dimension = this;
    }
  }

  /**
   * gets the element's ID
   */
  get id(): string {
    return this._expression;
  }

  /**
   * Gets the child attributes
   */
  get attributes(): Attribute[] {
    return this._attributes;
  }

  /**
   * Gets the child dimensions
   */
  get dimensions(): Dimension[] {
    return this._dimensions;
  }

  get expression(): string {
    return this._expression;
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
   * Gets a sorted {@link Dimension} with the given definition
   *
   * @param sort - Sort definition
   * @returns An instance representing the sorted {@link Dimension} of this instance
   */
  sort(sort: Sort): Attribute {
    return new DimensionalDimension(
      this.name,
      this.expression,
      this.attributes,
      this.dimensions,
      this.type,
      this.description,
      sort,
    );
  }

  /**
   * Gets a serializable representation of the element
   */
  serializable(): any {
    const result = super.serializable();

    result.expression = this.expression;

    if (this.getSort() !== undefined) {
      result.sort = this.getSort();
    }

    result.attributes = this._attributes.map((att) => att.serializable());
    result.diemsnions = this._dimensions.map((dim) => dim.serializable());

    if (this.defaultAttribute) {
      result.defaultAttribute = this.defaultAttribute.serializable();
    }

    return result;
  }

  /**
   * Gets the JAQL representation of this instance
   *
   * @param nested - defines whether the JAQL is nested within parent JAQL statement or a root JAQL element
   */
  jaql(nested?: boolean): any {
    if (this.defaultAttribute) {
      return this.defaultAttribute.jaql(nested);
    }

    if (this.dimensions.length > 0) {
      return this.dimensions[0].jaql(nested);
    }

    const result = <any>{
      jaql: {
        title: this.name,
        dim: this.expression,
        datatype: jaqlSimpleColumnType(this.type),
      },
    };

    if (this._sort != Sort.None) {
      result.jaql.sort = this._sort == Sort.Ascending ? 'asc' : 'desc';
    }

    return nested === true ? result.jaql : result;
  }
}

/**
 * Represents a Date Dimension in a Dimensional Model
 *
 * @internal
 */
export class DimensionalDateDimension extends DimensionalDimension implements DateDimension {
  constructor(name: string, expression: string, desc?: string, sort?: Sort) {
    super(name, expression, [], [], MetadataTypes.DateDimension, desc, sort);

    this.defaultLevel = DateLevels.Years;
    this.Years = new DimensionalLevelAttribute(
      DateLevels.Years,
      expression,
      DateLevels.Years,
      'yyyy',
    );
    this.Quarters = new DimensionalLevelAttribute(
      DateLevels.Quarters,
      expression,
      DateLevels.Quarters,
      'Q yyyy',
    );
    this.Months = new DimensionalLevelAttribute(
      DateLevels.Months,
      expression,
      DateLevels.Months,
      'yyyy-MM',
    );
    this.Weeks = new DimensionalLevelAttribute(
      DateLevels.Weeks,
      expression,
      DateLevels.Weeks,
      'ww yyyy',
    );
    this.Days = new DimensionalLevelAttribute(
      DateLevels.Days,
      expression,
      DateLevels.Days,
      'yyyy-MM-dd',
    );
    this.Hours = new DimensionalLevelAttribute(
      DateLevels.Hours,
      expression,
      DateLevels.Hours,
      'yyyy-MM-dd HH:mm',
    );
    this.MinutesRoundTo30 = new DimensionalLevelAttribute(
      DateLevels.MinutesRoundTo30,
      expression,
      DateLevels.MinutesRoundTo30,
      'yyyy-MM-dd HH:mm',
    );
    this.MinutesRoundTo15 = new DimensionalLevelAttribute(
      DateLevels.MinutesRoundTo15,
      expression,
      DateLevels.MinutesRoundTo15,
      'yyyy-MM-dd HH:mm',
    );

    this.AggHours = new DimensionalLevelAttribute(
      DateLevels.AggHours,
      expression,
      DateLevels.AggHours,
      'HH:mm',
    );
    this.AggMinutesRoundTo30 = new DimensionalLevelAttribute(
      DateLevels.AggMinutesRoundTo30,
      expression,
      DateLevels.AggMinutesRoundTo30,
      'HH:mm',
    );
    this.AggMinutesRoundTo15 = new DimensionalLevelAttribute(
      DateLevels.AggMinutesRoundTo15,
      expression,
      DateLevels.AggMinutesRoundTo15,
      'HH:mm',
    );
    this.AggMinutesRoundTo1 = new DimensionalLevelAttribute(
      DateLevels.AggMinutesRoundTo1,
      expression,
      DateLevels.AggMinutesRoundTo1,
      'HH:mm',
    );

    this.setAttributes([
      this.Years,
      this.Quarters,
      this.Months,
      this.Weeks,
      this.Days,
      this.Hours,
      this.MinutesRoundTo30,
      this.MinutesRoundTo15,
      this.AggHours,
      this.AggMinutesRoundTo30,
      this.AggMinutesRoundTo15,
      this.AggMinutesRoundTo1,
    ]);
  }

  /**
   * Years level
   */
  readonly Years: LevelAttribute;

  /**
   * Quarters level
   */
  readonly Quarters: LevelAttribute;

  /**
   * Months level
   */
  readonly Months: LevelAttribute;

  /**
   * Weeks level
   */
  readonly Weeks: LevelAttribute;

  /**
   * Days level
   */
  readonly Days: LevelAttribute;

  /**
   * Hours level
   */
  readonly Hours: LevelAttribute;

  /**
   * Minutes (round to 30) level
   */
  readonly MinutesRoundTo30: LevelAttribute;

  /**
   * Minutes (round to 15) level
   */
  readonly MinutesRoundTo15: LevelAttribute;

  /**
   * Aggregated Hours  level
   */
  readonly AggHours: LevelAttribute;

  /**
   * Aggregated Minutes (round to 30) level
   */
  readonly AggMinutesRoundTo30: LevelAttribute;

  /**
   * Aggregated Minutes (round to 15) level
   */
  readonly AggMinutesRoundTo15: LevelAttribute;

  /**
   * Aggregated Minutes (every minute) level
   */
  readonly AggMinutesRoundTo1: LevelAttribute;

  defaultLevel: string;

  /**
   * gets the element's ID
   */
  get id(): string {
    return this.expression;
  }

  protected setDimensions() {
    /* */
  }

  protected setAttributes(attributes: Attribute[]) {
    this._attributes = attributes;
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
   * Gets a sorted {@link Dimension} with the given definition
   *
   * @param sort - Sort definition
   * @returns An instance representing the sorted {@link Dimension} of this instance
   */
  sort(sort: Sort): Attribute {
    return new DimensionalDateDimension(this.name, this.expression, this.description, sort);
  }

  /**
   * Gets a serializable representation of the element
   */
  serializable(): any {
    const result = super.serializable();

    if (this.defaultLevel) {
      result.defaultLevel = this.defaultLevel;
    }

    return result;
  }

  /**
   * Gets the JAQL representation of this instance
   *
   * @param nested - defines whether the JAQL is nested within parent JAQL statement or a root JAQL element
   */
  jaql(nested?: boolean): any {
    const result = this[this.defaultLevel].jaql();
    result.jaql.title = this.name;
    return nested ? result.jaql : result;
  }
}

/**
 * Creates a new Dimension instance from the given JSON object.
 *
 * This function is used in the generated data model code to create dimensions for an input data source.
 *
 * See also functions {@link createDateDimension} and {@link createAttribute}.
 *
 * @param json - JSON object representing the Dimension
 * @returns A new Dimension instance
 */
export function createDimension(json: any): Dimension {
  const name = json.name || json.title;
  const description = json.desc || json.description;
  const expression = json.expression || json.dim;
  const type = DimensionalDimension.parseType(json.dimtype || json.type);

  // date dimension
  if (type == MetadataTypes.DateDimension) {
    return new DimensionalDateDimension(name, expression);
  }

  // attributes
  const atts: DimensionalAttribute[] = Object.getOwnPropertyNames(json)
    .map((p) => json[p])
    .filter((v) => MetadataTypes.isAttribute(v.type));
  if (atts.length == 0) {
    if (json.attributes) {
      let att;
      for (let i = 0; i < json.attributes.length; i++) {
        att = json.attributes[i];

        atts.push(new DimensionalAttribute(att.name, att.expression, att.type));
      }
    }

    // default attribute
    else if (expression) {
      atts.push(new DimensionalAttribute(name, expression));
    }
  }

  // nested dimensions
  const dims: Dimension[] = Object.getOwnPropertyNames(json)
    .map((p) => json[p])
    .filter((v) => MetadataTypes.isDimension(v.type));
  if (dims.length == 0 && json.dimensions) {
    for (let i = 0; i < json.dimensions.length; i++) {
      dims.push(createDimension(json.dimensions[i]));
    }
  }

  const d = new DimensionalDimension(name, expression, atts, dims, type, description);

  if (json.defaultAttribute) {
    d.defaultAttribute = atts.find((a) => a.name === json.defaultAttribute);
  }

  return d;
}

/**
 * Creates a new Date Dimension instance from the given JSON object.
 *
 * This function is used in the generated data model code to create date dimensions for an input data source.
 *
 * See also functions {@link createDimension} and {@link createAttribute}.
 *
 * @param json - JSON object representing the Date Dimension
 * @returns A new Date Dimension instance
 */
export function createDateDimension(json: any): DateDimension {
  const name = json.name || json.title;
  const expression = json.expression || json.dim;
  return new DimensionalDateDimension(name, expression);
}
