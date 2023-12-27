import { defineComponent, inject, provide } from 'vue';
import type { PropType, InjectionKey } from 'vue';
import type { SisenseContextProviderProps } from '@sisense/sdk-ui-preact';
import {
  ClientApplication,
  createClientApplication,
  createContextProviderRenderer,
  CustomSisenseContextProvider,
} from '@sisense/sdk-ui-preact';
import { toDeepRaw } from '../setup-helper';

const sisenseContextConfigKey = Symbol() as InjectionKey<SisenseContextProviderProps>;

/**
 * Gets Sisense context
 */
export const getSisenseContext = () => {
  const sisenseContext = inject(sisenseContextConfigKey);

  if (!sisenseContext) {
    throw new Error('SisenseContextProvider: props are required');
  }

  return sisenseContext;
};

/**
 * Gets Sisense application
 */
export const getApp = (): Promise<ClientApplication> => {
  const sisenseContext = getSisenseContext();
  return createClientApplication(sisenseContext);
};

/**
 * Creates Sisense context connector
 */
export const createSisenseContextConnector = () => {
  return {
    async prepareContext() {
      const app = await getApp();

      return {
        app,
        isInitialized: true,
      };
    },
    renderContextProvider: createContextProviderRenderer(CustomSisenseContextProvider),
  };
};

/**
 * Sisense Context Provider
 *
 */
export const SisenseContextProvider = defineComponent({
  props: {
    defaultDataSource: String as PropType<SisenseContextProviderProps['defaultDataSource']>,
    url: String as PropType<SisenseContextProviderProps['url']>,
    ssoEnabled: Boolean as PropType<SisenseContextProviderProps['ssoEnabled']>,
    token: String as PropType<SisenseContextProviderProps['token']>,
    wat: String as PropType<SisenseContextProviderProps['wat']>,
    appConfig: Object as PropType<SisenseContextProviderProps['appConfig']>,
    /**
     * @internal
     */
    showRuntimeErrors: Boolean as PropType<SisenseContextProviderProps['showRuntimeErrors']>,
    /**
     * @internal
     */
    enableTracking: Boolean as PropType<SisenseContextProviderProps['enableTracking']>,
  },

  setup(props, { slots }) {
    const rawProps = toDeepRaw(props);
    provide(sisenseContextConfigKey, rawProps as SisenseContextProviderProps);

    return () => slots.default?.();
  },
});
