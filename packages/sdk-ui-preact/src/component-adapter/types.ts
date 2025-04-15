import { type VNode } from 'preact';

export type ContextData = any;
export type ComponentBuilder = () => VNode;
export type Context = {
  isReady: boolean;
  data?: ContextData;
  error?: Error;
};
export type AnyHookFunction = (...args: any[]) => any;
/** @internal */
export type AnyComponentFunction<P = any> = (props: P) => any;
