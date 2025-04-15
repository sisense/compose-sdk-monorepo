import { watchEffect } from 'vue';
import type { ContextConnector, CustomSisenseContextProviderProps } from '@sisense/sdk-ui-preact';
import { CustomSisenseContextProvider, DataObserver } from '@sisense/sdk-ui-preact';
import { getSisenseContext } from '../../providers';

/**
 * Creates Sisense context connector
 * @internal
 */
export const createSisenseContextConnector =
  (): ContextConnector<CustomSisenseContextProviderProps> => {
    const sisenseContext = getSisenseContext();
    const propsObserver = new DataObserver<CustomSisenseContextProviderProps>({
      context: sisenseContext.value,
    });

    watchEffect(() => {
      propsObserver.setValue({ context: sisenseContext.value });
    });

    return {
      propsObserver,
      providerComponent: CustomSisenseContextProvider,
    };
  };
