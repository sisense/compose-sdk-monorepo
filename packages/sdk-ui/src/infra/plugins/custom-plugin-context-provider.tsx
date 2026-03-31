import { type PropsWithChildren } from 'react';

import { CustomContextProviderProps } from '../../types';
import { PluginProvider } from './plugin-provider.js';
import type { Plugin } from './types.js';

/** @internal */
export type CustomPluginContextProviderContext = {
  plugins: Plugin[];
};

/** @internal */
export type CustomPluginContextProviderProps =
  CustomContextProviderProps<CustomPluginContextProviderContext>;

/**
 * Custom Plugin Context Provider component that allows passing external plugin context.
 *
 * Specifically designed to serve as a bridge for passing plugin context between an
 * external framework wrapper and child React components.
 *
 * @internal
 */
export const CustomPluginContextProvider: React.FC<
  PropsWithChildren<CustomPluginContextProviderProps>
> = ({ context, error, children }) => {
  if (error) {
    throw error;
  }
  return <PluginProvider plugins={context?.plugins ?? []}>{children}</PluginProvider>;
};
