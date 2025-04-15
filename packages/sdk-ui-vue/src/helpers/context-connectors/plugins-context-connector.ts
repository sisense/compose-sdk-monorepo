import { watchEffect } from 'vue';
import { CustomPluginsProvider, DataObserver } from '@sisense/sdk-ui-preact';
import type { ContextConnector, CustomPluginsProviderProps } from '@sisense/sdk-ui-preact';
import { getPluginsContext } from '../../providers';

/**
 * Creates plugins context connector
 *
 * @group Contexts
 * @internal
 */
export const createPluginsContextConnector = (): ContextConnector<CustomPluginsProviderProps> => {
  const pluginsContext = getPluginsContext();
  const propsObserver = new DataObserver<CustomPluginsProviderProps>({
    context: pluginsContext.value,
  });

  watchEffect(() => {
    propsObserver.setValue({
      context: pluginsContext.value,
    });
  });

  return {
    propsObserver,
    providerComponent: CustomPluginsProvider,
  };
};
