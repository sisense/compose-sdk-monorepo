import { type FunctionComponent, type PropsWithChildren, type ReactNode } from 'react';

import { CoreModule } from './core-module.js';
import { useModuleApiRegistry } from './modules-context.js';

/**
 * Registers providers passed via the `core.providers` API.
 *
 * The registry is read from the enclosing `ModuleProvider`, so each
 * `SisenseContextProvider` instance mounts only the providers contributed by
 * the modules it registered. Providers are mounted in registration
 * (topological) order — the first entry is the outermost wrapper.
 *
 */
export const CoreModuleProvidersTree: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const providers = useModuleApiRegistry(CoreModule, 'providers');
  return (
    <>
      {providers.reduceRight<ReactNode>(
        (acc, Provider) => (
          <Provider>{acc}</Provider>
        ),
        children,
      )}
    </>
  );
};
