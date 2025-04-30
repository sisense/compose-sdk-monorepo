/* eslint-disable max-params */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { parseExpression } from '../../utils.js';
import {
  DimensionalAttribute,
  DimensionalLevelAttribute,
  jaqlSimpleColumnType,
  normalizeAttributeName,
} from '../attributes.js';
import { DimensionalElement, normalizeName } from '../base.js';
import { DATA_MODEL_MODULE_NAME } from '../consts.js';
import { Attribute, DateDimension, Dimension, LevelAttribute } from '../interfaces.js';
import { DateLevels, JaqlDataSource, JSONObject, MetadataTypes, Sort } from '../types.js';

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
    dataSource?: JaqlDataSource,
    composeCode?: string,
    defaultAttribute?: Attribute,
  ) {
    super(name, type || MetadataTypes.Dimension, desc, dataSource, composeCode);

    // if composeCode is not explicitly set by the caller, extract it from expression
    if (!composeCode && expression) {
      const { table, column } = parseExpression(expression);
      this.composeCode = normalizeAttributeName(table, column, '', DATA_MODEL_MODULE_NAME);
    }

    this._sort = sort || Sort.None;
    this._expression = expression;
    this.setDimensions(dimensions || []);
    this.setAttributes(attributes);
    if (defaultAttribute) {
      this.defaultAttribute = defaultAttribute;
    }
  }

  private getAttachedName(name: string, expression: string): string {
    let result = name;

    // if exists fallback to expression
    const normalizedName = normalizeName(name);
    if (
      normalizedName === 'id' ||
      normalizedName === 'name' ||
      Object.getOwnPropertyDescriptor(this, normalizedName) !== undefined ||
      this[normalizedName] !== undefined
    ) {
      result = expression;
    }

    return result;
  }

  protected setDimensions(dimensions: Dimension[]) {
    this._dimensions = dimensions;

    for (let i = 0; i < dimensions.length; i++) {
      const n = this.getAttachedName(dimensions[i].name, dimensions[i].attributes[0].expression);

      this[normalizeName(n)] = dimensions[i];

      if (n != dimensions[i].name) {
        dimensions[i].name = n;
      }
    }
  }

  protected setAttributes(attributes: Attribute[]) {
    this._attributes = attributes || [];

    for (let i = 0; i < attributes.length; i++) {
      const n = this.getAttachedName(attributes[i].name, attributes[i].expression);

      this[normalizeName(n)] = attributes[i];

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
      this.dataSource,
      this.composeCode,
      this.defaultAttribute,
    );
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();
    result.__serializable = 'DimensionalDimension';

    result.expression = this.expression;

    if (this.getSort() !== undefined) {
      result.sort = this.getSort();
    }

    result.attributes = this._attributes.map((att) => att.serialize());
    result.dimensions = this._dimensions.map((dim) => dim.serialize());

    if (this.defaultAttribute) {
      result.defaultAttribute = this.defaultAttribute.serialize();
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
  constructor(
    name: string,
    expression: string,
    desc?: string,
    sort?: Sort,
    dataSource?: JaqlDataSource,
    composeCode?: string,
  ) {
    super(
      name,
      expression,
      [],
      [],
      MetadataTypes.DateDimension,
      desc,
      sort,
      dataSource,
      composeCode,
    );

    this.defaultLevel = DateLevels.Years;
    this.Years = new DimensionalLevelAttribute(
      DateLevels.Years,
      expression,
      DateLevels.Years,
      'yyyy',
      desc,
      sort,
      dataSource,
    );
    this.Quarters = new DimensionalLevelAttribute(
      DateLevels.Quarters,
      expression,
      DateLevels.Quarters,
      'Q yyyy',
      desc,
      sort,
      dataSource,
    );
    this.Months = new DimensionalLevelAttribute(
      DateLevels.Months,
      expression,
      DateLevels.Months,
      'yyyy-MM',
      desc,
      sort,
      dataSource,
    );
    this.Weeks = new DimensionalLevelAttribute(
      DateLevels.Weeks,
      expression,
      DateLevels.Weeks,
      'ww yyyy',
      desc,
      sort,
      dataSource,
    );
    this.Days = new DimensionalLevelAttribute(
      DateLevels.Days,
      expression,
      DateLevels.Days,
      'yyyy-MM-dd',
      desc,
      sort,
      dataSource,
    );
    this.Hours = new DimensionalLevelAttribute(
      DateLevels.Hours,
      expression,
      DateLevels.Hours,
      'yyyy-MM-dd HH:mm',
      desc,
      sort,
      dataSource,
    );
    this.MinutesRoundTo30 = new DimensionalLevelAttribute(
      DateLevels.MinutesRoundTo30,
      expression,
      DateLevels.MinutesRoundTo30,
      'yyyy-MM-dd HH:mm',
      desc,
      sort,
      dataSource,
    );
    this.MinutesRoundTo15 = new DimensionalLevelAttribute(
      DateLevels.MinutesRoundTo15,
      expression,
      DateLevels.MinutesRoundTo15,
      'yyyy-MM-dd HH:mm',
      desc,
      sort,
      dataSource,
    );
    this.Minutes = new DimensionalLevelAttribute(
      DateLevels.Minutes,
      expression,
      DateLevels.Minutes,
      'yyyy-MM-dd HH:mm',
      desc,
      sort,
      dataSource,
    );
    this.Seconds = new DimensionalLevelAttribute(
      DateLevels.Seconds,
      expression,
      DateLevels.Seconds,
      'yyyy-MM-dd HH:mm:ss',
      desc,
      sort,
      dataSource,
    );

    this.AggHours = new DimensionalLevelAttribute(
      DateLevels.AggHours,
      expression,
      DateLevels.AggHours,
      'HH:mm',
      desc,
      sort,
      dataSource,
    );
    this.AggMinutesRoundTo30 = new DimensionalLevelAttribute(
      DateLevels.AggMinutesRoundTo30,
      expression,
      DateLevels.AggMinutesRoundTo30,
      'HH:mm',
      desc,
      sort,
      dataSource,
    );
    this.AggMinutesRoundTo15 = new DimensionalLevelAttribute(
      DateLevels.AggMinutesRoundTo15,
      expression,
      DateLevels.AggMinutesRoundTo15,
      'HH:mm',
      desc,
      sort,
      dataSource,
    );
    this.AggMinutesRoundTo1 = new DimensionalLevelAttribute(
      DateLevels.AggMinutesRoundTo1,
      expression,
      DateLevels.AggMinutesRoundTo1,
      'HH:mm',
      desc,
      sort,
      dataSource,
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
      this.Minutes,
      this.Seconds,
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
   * Minutes level (for Live Models)
   */
  readonly Minutes: LevelAttribute;

  /**
   * Seconds level (for Live Models)
   */
  readonly Seconds: LevelAttribute;

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
    return new DimensionalDateDimension(
      this.name,
      this.expression,
      this.description,
      sort,
      this.dataSource,
      this.composeCode,
    );
  }

  /**
   * Gets a serializable representation of the element
   */
  serialize(): JSONObject {
    const result = super.serialize();
    result.__serializable = 'DimensionalDateDimension';
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
 * @group Data Model Utilities
 */
export function createDimension(json: any): Dimension {
  const name = json.name || json.title;
  const description = json.desc || json.description;
  const expression = json.expression || json.dim;
  const type = DimensionalDimension.parseType(json.dimtype || json.type);
  const sort = json.sort;
  const dataSource = json.dataSource;

  // date dimension
  if (type == MetadataTypes.DateDimension) {
    return new DimensionalDateDimension(name, expression, description, sort, dataSource);
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

        atts.push(
          new DimensionalAttribute(
            att.name,
            att.expression,
            att.type,
            att.description,
            att.sort,
            att.dataSource,
          ),
        );
      }
    }

    // default attribute
    else if (expression) {
      atts.push(new DimensionalAttribute(name, expression, type, description, sort, dataSource));
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

  const d = new DimensionalDimension(
    name,
    expression,
    atts,
    dims,
    type,
    description,
    sort,
    dataSource,
  );

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
 * @group Data Model Utilities
 */
export function createDateDimension(json: any): DateDimension {
  const name = json.name || json.title;
  const expression = json.expression || json.dim;
  const description = json.desc || json.description;
  const sort = json.sort;
  const dataSource = json.dataSource;
  return new DimensionalDateDimension(name, expression, description, sort, dataSource);
}
