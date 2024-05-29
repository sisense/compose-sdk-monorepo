/* eslint-disable @typescript-eslint/no-use-before-define */

import {
  Dimension,
  DateDimension,
  Attribute,
  MetadataTypes,
  LevelAttribute,
  DateLevels,
  normalizeName,
} from '@sisense/sdk-data';

import { ElementWriter, NEWLINE, escapeSpecialChars, rnt, writeIndented } from './base.js';
import { prepareDescription } from '../utils/prepare-description.js';

export class DimensionWriter extends ElementWriter<Dimension> {
  readonly isMultiAtts: boolean;

  readonly isCompound: boolean;

  readonly attributes: AttributeWriter[];

  readonly dims: DimensionWriter[];

  readonly isNested: boolean;

  constructor(dimension: Dimension, isNested: boolean) {
    super(dimension, normalizeName(dimension.name));

    this.isNested = isNested;
    this.isMultiAtts = dimension.attributes.length > 1;
    this.isCompound = dimension.dimensions.length > 1;
    this.attributes = dimension.attributes.map((att) => new AttributeWriter(att));
    this.dims = <DimensionWriter[]>(
      dimension.dimensions.map((d) =>
        MetadataTypes.isDateDimension(d.type)
          ? new DateDimensionWriter(<DateDimension>d, true)
          : new DimensionWriter(d, true),
      )
    );
  }

  isCustom(): boolean {
    return this.isMultiAtts || this.isCompound;
  }

  interfaceName(): string {
    return this.isCustom() ? this.name + 'Dimension' : 'Dimension';
  }

  writeInterface(stream: NodeJS.WritableStream) {
    if (!this.isCustom()) {
      return;
    }

    // writing nested interfaces
    for (let i = 0; i < this.dims.length; i++) {
      this.dims[i].writeInterface(stream);
    }

    // custom dimension implementation -> declaring attributes & dimensions
    stream.write(`interface ${this.interfaceName()} extends Dimension {${NEWLINE}`);

    for (let i = 0; i < this.attributes.length; i++) {
      writeIndented(stream, `${this.attributes[i].name}: Attribute;${NEWLINE}`, 1);
    }

    for (let i = 0; i < this.dims.length; i++) {
      writeIndented(stream, `${this.dims[i].name}: ${this.dims[i].interfaceName()};${NEWLINE}`, 1);
    }

    stream.write(`}${NEWLINE}`);
  }

  writeDef(stream: NodeJS.WritableStream, ident: number) {
    writeIndented(stream, `createDimension({${rnt(ident + 1)}name: '${this.element.name}',`, ident);

    this.attributes.forEach((att) => {
      stream.write(`${NEWLINE}`);
      writeIndented(stream, `${att.name}: `, ident + 1);
      att.write(stream, ident);
    });

    this.dims.forEach((d) => {
      stream.write(`${NEWLINE}`);
      writeIndented(stream, `${d.name}: `, ident + 1);
      d.write(stream, ident + 1);
    });

    stream.write(NEWLINE);

    if (!this.isNested) {
      writeIndented(stream, `}) as ${this.interfaceName()};`, ident);
    } else {
      writeIndented(stream, `}),`, ident);
    }
  }

  write(stream: NodeJS.WritableStream, ident: number): any {
    if (!this.isNested) {
      // creating a dedicated interface for dimensions with multiple attributes
      this.writeInterface(stream);

      stream.write(`export const ${this.name} = `);

      ident = 0;
    }

    this.writeDef(stream, ident);
  }
}

export class DateDimensionWriter extends ElementWriter<DateDimension> {
  //readonly isCompound:boolean;
  readonly isNested: boolean;

  private levels: LevelWriter[];

  constructor(dimension: DateDimension, isNested: boolean) {
    super(dimension, normalizeName(dimension.name));
    this.isNested = isNested;
    this.levels = dimension.attributes.map((l) => new LevelWriter(<LevelAttribute>(<any>l)));
  }

  isCustom(): boolean {
    return DateLevels.all.some(
      (lvl, i) => (<LevelAttribute>this.element.attributes[i]).granularity !== lvl,
    );
  }

  interfaceName(): string {
    return this.isCustom() ? this.name + 'DateDimension' : 'DateDimension';
  }

  writeInterface(stream: NodeJS.WritableStream) {
    if (!this.isCustom()) {
      return;
    }

    stream.write(`interface ${this.interfaceName()} extends DateDimension { ${NEWLINE} `);

    for (let i = 0; i < this.levels.length; i++) {
      if (i > 0) {
        stream.write(`,${NEWLINE}`);
      }

      writeIndented(stream, `${this.levels[i].name}: LevelAttribute`, 1);
    }

    stream.write(`${NEWLINE}} ${NEWLINE}`);
  }

  writeDef(stream: NodeJS.WritableStream, ident: number) {
    writeIndented(stream, `createDateDimension({${NEWLINE}`, 0);
    writeIndented(stream, `name: '${this.element.name}',${NEWLINE}`, ident + 1);
    writeIndented(
      stream,
      `expression: '${escapeSpecialChars(this.element.expression)}',`,
      ident + 1,
    );
    if (this.element.description) {
      writeIndented(
        stream,
        `description: ${prepareDescription(this.element.description)},`,
        ident + 1,
      );
    }

    stream.write(NEWLINE);
    writeIndented(stream, `}),`, ident);

    if (!this.isNested) {
      stream.write(`;${NEWLINE}`);
    }
  }

  write(stream: NodeJS.WritableStream, ident: number): any {
    if (!this.isNested) {
      // creating a dedicated interface for dimensions with multiple attributes
      this.writeInterface(stream);

      stream.write(`export const ${this.name} = ${NEWLINE}`);

      ident = 1;
    }

    this.writeDef(stream, ident);
  }
}

export class AttributeWriter extends ElementWriter<Attribute> {
  constructor(attribute: Attribute) {
    super(attribute, normalizeName(attribute.name));
  }

  write(stream: NodeJS.WritableStream, ident: number): any {
    writeIndented(
      stream,
      `createAttribute({\
${rnt(ident + 2)}name: '${this.element.name}',\
${rnt(ident + 2)}type: '${this.element.type}',\
${rnt(ident + 2)}expression: '${escapeSpecialChars(this.element.expression)}',\
${this.element.description ? `${rnt(ident + 2)}description: ${prepareDescription(this.element.description)},` : ''}\
${rnt(ident + 1)}}),`,
      ident,
    );
  }
}

export class LevelWriter extends ElementWriter<LevelAttribute> {
  constructor(level: LevelAttribute) {
    super(level, normalizeName(level.name));
  }

  write(stream: NodeJS.WritableStream, ident: number): any {
    writeIndented(
      stream,
      `createAttribute({name: '${this.name}', expression: '${escapeSpecialChars(this.element.expression)}', granularity: '${this.element.granularity}'}),`,
      ident,
    );
  }
}
