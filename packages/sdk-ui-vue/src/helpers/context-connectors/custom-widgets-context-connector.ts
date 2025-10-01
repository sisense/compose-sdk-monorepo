import { watchEffect } from 'vue';
import { CustomWidgetsProviderAdapter, DataObserver } from '@ethings-os/sdk-ui-preact';
import type { ContextConnector, CustomWidgetsProviderAdapterProps } from '@ethings-os/sdk-ui-preact';
import { getCustomWidgetsContext } from '../../providers';

/**
 * Creates custom widgets context connector
 *
 * @group Contexts
 * @internal
 */
export const createCustomWidgetsContextConnector =
  (): ContextConnector<CustomWidgetsProviderAdapterProps> => {
    const customWidgetsContext = getCustomWidgetsContext();
    const propsObserver = new DataObserver<CustomWidgetsProviderAdapterProps>({
      context: customWidgetsContext.value,
    });

    watchEffect(() => {
      propsObserver.setValue({
        context: customWidgetsContext.value,
      });
    });

    return {
      propsObserver,
      providerComponent: CustomWidgetsProviderAdapter,
    };
  };
