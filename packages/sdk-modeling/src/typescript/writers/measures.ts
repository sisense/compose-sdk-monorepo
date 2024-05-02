/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable sonarjs/no-nested-template-literals */

import { BaseMeasure, MeasureTemplate, normalizeName } from '@sisense/sdk-data';

import { NEWLINE, rnt, writeIndented, ElementWriter } from './base.js';
import { prepareDescription } from '../utils/prepare-description.js';

export abstract class MeasureWriter<T> extends ElementWriter<T> {
  readonly isNested: boolean;

  constructor(measure: T, isNested: boolean) {
    super(measure, normalizeName((<any>measure).name));

    this.isNested = isNested;
  }

  abstract writeDef(stream: NodeJS.WritableStream, ident: number): void;

  write(stream: NodeJS.WritableStream, ident: number): any {
    if (!this.isNested) {
      stream.write(`export const ${this.name} = `);
    }

    this.writeDef(stream, ident);

    if (!this.isNested) {
      stream.write(`;${NEWLINE}`);
    }
  }
}

export class BaseMeasureWriter extends MeasureWriter<BaseMeasure> {
  constructor(measure: BaseMeasure, isNested: boolean) {
    super(measure, isNested);
  }

  writeDef(stream: NodeJS.WritableStream, idnt: number): void {
    writeIndented(
      stream,
      `<BaseMeasure>createMeasure({\
                ${rnt(idnt + 1)}name: "${this.name}", \
                ${rnt(idnt + 1)}expression: "${this.element.attribute.expression}", \
                ${rnt(idnt + 1)}agg: "${this.element.aggregation}"${
                  this.element.getFormat()
                    ? `,${rnt(idnt + 1)}format:"${this.element.getFormat()}"`
                    : ''
                }${
                  this.element.description
                    ? `,${rnt(idnt + 1)}description: ${prepareDescription(this.element.description)}`
                    : ''
                }})`,
      idnt,
    );
  }
}

// class SCalculatedMeasure extends SMeasure{

//     private measure:CalculatedMeasure;

//     constructor(measure:CalculatedMeasure, isNested:boolean) {

//         super(normalizeName(measure.name), isNested);

//         this.measure = measure;
//     }

//     writeDef(stream:WriteStream, ident:number) : void {

//         writeIndented(stream, `<CalculatedMeasure>createMeasure({name: "${this.name}", expression: "${this.measure.attribute.expression}", agg: "${this.measure.aggregation}" })`, ident);
//     }
// }

export class MeasureTemplateWriter extends MeasureWriter<MeasureTemplate> {
  constructor(measure: MeasureTemplate, isNested: boolean) {
    super(measure, isNested);
  }

  writeDef(stream: NodeJS.WritableStream, ident: number): void {
    writeIndented(
      stream,
      `<MeasureTemplate>createMeasure({\
                ${rnt(ident + 1)}name: "${this.name}", \
                ${rnt(ident + 1)}expression: "${this.element.attribute.expression}", \
                ${rnt(ident + 1)}agg: "*"${
                  this.element.getFormat()
                    ? `,${rnt(ident + 1)}format:"${this.element.getFormat()}"`
                    : ''
                }${
                  this.element.description
                    ? `,${rnt(ident + 1)}description: ${prepareDescription(this.element.description)}`
                    : ''
                }})`,
      ident,
    );
  }
}
