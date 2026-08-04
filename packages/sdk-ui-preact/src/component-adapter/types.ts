import { type ReactNode } from 'react';

import { type VNode } from 'preact';

/**
 * Any node a component of this layer renders.
 *
 * Preact runs through `preact/compat`, so the component interfaces shared with `sdk-ui` describe
 * their render output with React's node type. Named here once, so the framework wrappers built on
 * this layer can refer to a Preact node without depending on React themselves.
 *
 * @internal
 */
export type PreactNode = ReactNode;

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
