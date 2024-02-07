import { defineComponent, inject, provide, ref } from 'vue';
import type { PropType, InjectionKey, Ref } from 'vue';
import type { SisenseContextProviderProps } from '@sisense/sdk-ui-preact';
import {
  ClientApplication,
  createClientApplication,
  createContextProviderRenderer,
  CustomSisenseContextProvider,
} from '@sisense/sdk-ui-preact';
import { toDeepRaw } from '../setup-helper';

const sisenseContextAppKey = Symbol() as InjectionKey<{
  app: Ref<ClientApplication>;
}>;

/**
 * Gets Sisense application
 */
export const getApp = async () => {
  const app = inject(sisenseContextAppKey)!.app;
  return app.value;
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
    const app = ref();
    provide(sisenseContextAppKey, { app });
    createClientApplication(rawProps as SisenseContextProviderProps).then((newApp) => {
      app.value = newApp;
    });

    return () => {
      if (!app.value) return null;
      return slots.default?.();
    };
  },
});
