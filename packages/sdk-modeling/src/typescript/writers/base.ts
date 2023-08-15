/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { WriteStream } from 'fs';

export const NEWLINE = '\n';

export function writeIndented(stream: WriteStream, s: string, idnt: number) {
  if (idnt > 0) {
    stream.write(indent(idnt));
  }

  stream.write(s);
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

export abstract class BaseWriter<T> {
  readonly element: T;

  readonly name: string;

  constructor(element: T, name: string) {
    this.element = element;
    this.name = name;
  }

  abstract write(stream: WriteStream, ident: number): any;
}
