import type {
  ContextConnector,
  CustomSisenseContextProviderProps,
} from '@sisense/sdk-ui-preact/internal';
import { CustomSisenseContextProvider, DataObserver } from '@sisense/sdk-ui-preact/internal';
import { watchEffect } from 'vue';

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
