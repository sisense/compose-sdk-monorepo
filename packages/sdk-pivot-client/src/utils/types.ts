/* eslint-disable @typescript-eslint/ban-types */
// import { CSSProperties } from 'react';

export interface LoggerI {
  setName(name: string): void;
  getName(): string;
  console: Console;
  log: Function;
  warn: Function;
  error: Function;
}

export type Console = {
  log: (args: any) => void;
  warn: (args: any) => void;
  error: (args: any) => void;
};

export type Defer = {
  promise: Promise<any>;
  resolve: Function;
  reject: Function;
};

// export type InputStyles = CSSProperties & {
//     databarColor?: string,
// };
//
// export type Styles = CSSProperties;

export type CloneFn = <T>(obj: T, skipChildren?: boolean) => T;

export type Values<T extends {}> = T[keyof T];
