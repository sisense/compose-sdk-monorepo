import { defineComponent, inject, provide, ref } from 'vue';
import type { PropType, InjectionKey, Ref } from 'vue';
import type { SisenseContextProviderProps } from '@sisense/sdk-ui-preact';
import {
  createClientApplication,
  createContextProviderRenderer,
  CustomSisenseContextProvider,
  type CustomSisenseContext,
} from '@sisense/sdk-ui-preact';

const defaultSisenseContext: CustomSisenseContext = {
  isInitialized: false,
  app: undefined,
  showRuntimeErrors: true,
  tracking: {
    enabled: true,
    packageName: 'sdk-ui-vue',
  },
};

const sisenseContextKey = Symbol('sisenseContextKey') as InjectionKey<Ref<CustomSisenseContext>>;

/**
 * Gets Sisense application
 * @internal
 */
export const getSisenseContext = () => {
  return inject(sisenseContextKey, ref(defaultSisenseContext)) as Ref<CustomSisenseContext>;
};

/**
 * Creates Sisense context connector
 * @internal
 */
export const createSisenseContextConnector = (context: CustomSisenseContext) => {
  return {
    async prepareContext() {
      return context;
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
 * @group Contexts
 */
export const SisenseContextProvider = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!SisenseContextProviderProps.defaultDataSource}
     *
     * @category Sisense App
     */
    defaultDataSource: String as PropType<SisenseContextProviderProps['defaultDataSource']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SisenseContextProviderProps.url}
     *
     * @category Sisense App
     */
    url: String as PropType<SisenseContextProviderProps['url']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SisenseContextProviderProps.ssoEnabled}
     *
     * @category Sisense Authentication
     */
    ssoEnabled: Boolean as PropType<SisenseContextProviderProps['ssoEnabled']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SisenseContextProviderProps.token}
     *
     * @category Sisense Authentication
     */
    token: String as PropType<SisenseContextProviderProps['token']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SisenseContextProviderProps.wat}
     *
     * @category Sisense Authentication
     */
    wat: String as PropType<SisenseContextProviderProps['wat']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SisenseContextProviderProps.appConfig}
     *
     * @category Sisense App
     */
    appConfig: Object as PropType<SisenseContextProviderProps['appConfig']>,
    /**
     * @internal
     */
    showRuntimeErrors: {
      type: Boolean as PropType<SisenseContextProviderProps['showRuntimeErrors']>,
      default: defaultSisenseContext.showRuntimeErrors,
    },
    /**
     * @internal
     */
    enableTracking: {
      type: Boolean as PropType<SisenseContextProviderProps['enableTracking']>,
      default: defaultSisenseContext.tracking.enabled,
    },
  },

  setup(props, { slots }) {
    const context = ref<CustomSisenseContext>({
      ...defaultSisenseContext,
      isInitialized: true,
      showRuntimeErrors: props.showRuntimeErrors!,
      tracking: {
        ...defaultSisenseContext.tracking,
        enabled:
          props.enableTracking! &&
          (props.appConfig?.trackingConfig?.enabled ?? props.enableTracking),
      },
    });
    createClientApplication(props as SisenseContextProviderProps).then((newApp) => {
      context.value = {
        ...context.value,
        app: newApp,
      } as CustomSisenseContext;
    });

    provide(sisenseContextKey, context as Ref<CustomSisenseContext>);

    return () => {
      return slots.default?.();
    };
  },
});
