import { defineComponent, inject, provide, ref } from 'vue';
import type { PropType, InjectionKey, Ref } from 'vue';
import type { SisenseContextProviderProps } from '@sisense/sdk-ui-preact';
import {
  ClientApplication,
  createClientApplication,
  createContextProviderRenderer,
  CustomSisenseContextProvider,
} from '@sisense/sdk-ui-preact';

const sisenseContextAppKey = Symbol('sisenseContextAppKey') as InjectionKey<
  Ref<ClientApplication | undefined>
>;

/**
 * Gets Sisense application
 * @internal
 */
export const getApp = () => {
  return inject(sisenseContextAppKey, ref(undefined));
};

/**
 * Creates Sisense context connector
 * @internal
 */
export const createSisenseContextConnector = (app: ClientApplication) => {
  return {
    async prepareContext() {
      return {
        app,
        isInitialized: true,
      };
    },
    renderContextProvider: createContextProviderRenderer(CustomSisenseContextProvider),
  };
};

/**
 * Sisense Context Provider Component allowing you to connect to
 * a Sisense instance and provide that context
 * to all Compose SDK components in your application.
 *
 * @example
 * Here's how to use the `SisenseContextProvider` component to wrap your Sisense-enabled application:
 * Add SisenseContextProvider to the main component of your app as below and then wrap
 * other SDK components inside this component.
 * ```vue
 * <template>
 *   <SisenseContextProvider
 *     :url="sisenseUrl"
 *     :defaultDataSource="defaultDataSource"
 *     :ssoEnabled="true"
 *     :token="authToken"
 *     :wat="watToken"
 *     :appConfig="appConfigurations"
 *     :showRuntimeErrors="true"
 *     :enableTracking="false"
 *   >
 *     <!-- Your application components here -->
 *   </SisenseContextProvider>
 * </template>
 *
 * <script>
 * import { ref } from 'vue';
 * import SisenseContextProvider from './SisenseContextProvider.vue';
 *
 * export default {
 *   components: { SisenseContextProvider },
 *   setup() {
 *     const sisenseUrl = ref('https://your-sisense-instance.com');
 *     const defaultDataSource = ref('default_datasource_id');
 *     const authToken = ref('your_auth_token');
 *     const watToken = ref('your_wat_token');
 *     const appConfigurations = ref({});
 *
 *     return { sisenseUrl, defaultDataSource, authToken, watToken, appConfigurations };
 *   }
 * };
 * </script>
 * ```
 *
 * @param props - Sisense context provider props
 * @returns A Sisense Context Provider Component
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
    const app = ref<ClientApplication>();
    createClientApplication(props as SisenseContextProviderProps).then((newApp) => {
      app.value = newApp;
    });

    provide(sisenseContextAppKey, app);

    return () => {
      return slots.default?.();
    };
  },
});
