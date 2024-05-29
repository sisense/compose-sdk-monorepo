/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Writer } from './interfaces.js';

export const NEWLINE = '\n';

export function writeIndented(stream: NodeJS.WritableStream, s: string, idnt: number) {
  if (idnt > 0) {
    stream.write(indent(idnt));
  }

  stream.write(s);
}

export function escapeSpecialChars(expression: string) {
  return expression.replace(/'/g, "\\'");
}

// export function ident(stream:WriteStream, ident:number) {

//     if (ident > 0) {
//         stream.write("\t".repeat(ident));
//     }
// }

export function template(strings: TemplateStringsArray, ...keys: string[]): any {
  return function (...values: TemplateStringsArray) {
    const dict = values[values.length - 1] || {};
    const result = [strings[0]];
    keys.forEach(function (key, i) {
      const value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  };
}

export function rnt(idnt: number) {
  return NEWLINE + indent(idnt);
}

export function indent(ident: number) {
  // use two whitespaces for indentation
  return '  '.repeat(ident);
}

export abstract class ElementWriter<T> implements Writer {
  readonly element: T;

  readonly name: string;

  constructor(element: T, name: string) {
    this.element = element;
    this.name = name;
  }

  abstract write(stream: NodeJS.WritableStream, ident: number): any;
}
