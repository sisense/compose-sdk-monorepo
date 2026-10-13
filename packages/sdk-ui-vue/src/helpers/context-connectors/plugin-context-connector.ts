import type {
  ContextConnector,
  CustomPluginContextProviderProps,
} from '@sisense/sdk-ui-preact/internal';
import { CustomPluginContextProvider, DataObserver } from '@sisense/sdk-ui-preact/internal';
import { watchEffect } from 'vue';

import { getPluginsContext } from '../../providers';

/**
 * Creates plugin context connector
 * @internal
 */
export const createPluginContextConnector =
  (): ContextConnector<CustomPluginContextProviderProps> => {
    const pluginsContext = getPluginsContext();
    const propsObserver = new DataObserver<CustomPluginContextProviderProps>({
      context: { plugins: pluginsContext.value },
    });

    watchEffect(() => {
      propsObserver.setValue({ context: { plugins: pluginsContext.value } });
    });

    return {
      propsObserver,
      providerComponent: CustomPluginContextProvider,
    };
  };
