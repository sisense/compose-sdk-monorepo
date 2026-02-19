/* eslint-disable @typescript-eslint/ban-types */
export type Defer = {
  promise: Promise<any>;
  resolve: Function;
  reject: Function;
};

// Abstract CSSProperties to avoid conflicts with the React type
type CSSProperties = Record<string, string | number | null | undefined>;

export type InputStyles<P = CSSProperties> = P & {
  databarColor?: string;
};

export type Styles<P = CSSProperties> = P;

export type CloneFn = <T>(obj: T, skipChildren?: boolean) => T;
