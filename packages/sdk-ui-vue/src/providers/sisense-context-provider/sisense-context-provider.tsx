import { defineComponent, provide, ref } from 'vue';
import type { PropType, Ref } from 'vue';
import type { SisenseContextProviderProps as SisenseContextProviderPropsPreact } from '@ethings-os/sdk-ui-preact';
import { createClientApplication, type CustomSisenseContext } from '@ethings-os/sdk-ui-preact';
import { ThemeProvider } from '../theme-provider';
import { defaultSisenseContext, sisenseContextKey } from './sisense-context';

/**
 * Configurations and authentication for Sisense Context.
 *
 * Use one of the following to authenticate:
 *
 * - {@link @ethings-os/sdk-ui-vue!SisenseContextProviderProps.ssoEnabled | `ssoEnabled`}
 * - {@link @ethings-os/sdk-ui-vue!SisenseContextProviderProps.token | `token`}
 * - {@link @ethings-os/sdk-ui-vue!SisenseContextProviderProps.wat | `wat`}
 */
export interface SisenseContextProviderProps extends SisenseContextProviderPropsPreact {}

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
     * {@inheritDoc @ethings-os/sdk-ui!SisenseContextProviderProps.defaultDataSource}
     *
     * @category Sisense App
     */
    defaultDataSource: [String, Object] as PropType<
      SisenseContextProviderProps['defaultDataSource']
    >,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SisenseContextProviderProps.url}
     *
     * @category Sisense App
     */
    url: {
      type: String as PropType<SisenseContextProviderProps['url']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SisenseContextProviderProps.ssoEnabled}
     *
     * @category Sisense Authentication
     */
    ssoEnabled: Boolean as PropType<SisenseContextProviderProps['ssoEnabled']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SisenseContextProviderProps.token}
     *
     * @category Sisense Authentication
     */
    token: String as PropType<SisenseContextProviderProps['token']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SisenseContextProviderProps.wat}
     *
     * @category Sisense Authentication
     */
    wat: String as PropType<SisenseContextProviderProps['wat']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SisenseContextProviderProps.appConfig}
     *
     * @category Sisense App
     */
    appConfig: Object as PropType<SisenseContextProviderProps['appConfig']>,
    /**
     * @internal
     */
    showRuntimeErrors: {
      type: Boolean as PropType<SisenseContextProviderProps['showRuntimeErrors']>,
      default: defaultSisenseContext.errorBoundary.showErrorBox,
    },
  },

  setup(props, { slots }) {
    const context = ref<CustomSisenseContext>({
      ...defaultSisenseContext,
      isInitialized: true,
      errorBoundary: {
        showErrorBox: props.showRuntimeErrors ?? true,
      },
      tracking: {
        ...defaultSisenseContext.tracking,
        enabled: props.appConfig?.trackingConfig?.enabled ?? true,
      },
    });
    createClientApplication(props).then((newApp) => {
      context.value = {
        ...context.value,
        app: newApp,
      };
    });

    provide(sisenseContextKey, context as Ref<CustomSisenseContext>);

    return () => {
      return (
        <ThemeProvider theme={context.value.app?.settings.serverThemeSettings}>
          {slots.default?.()}
        </ThemeProvider>
      );
    };
  },
});
