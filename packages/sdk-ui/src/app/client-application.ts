/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-params */
import { HttpClient, getAuthenticator, isWatAuthenticator } from '@sisense/sdk-rest-client';
import { DimensionalQueryClient, QueryClient } from '@sisense/sdk-query-client';
import { DataSource } from '@sisense/sdk-data';
import { PivotClient } from '@sisense/sdk-pivot-client';
import { TrackingEventDetails } from '@sisense/sdk-tracking';
import { normalizeUrl } from '@sisense/sdk-common';
import { DateConfig } from '../query/date-formats';
import { AppSettings, getSettings } from './settings/settings';
import { TranslatableError } from '../translation/translatable-error';
import { CustomTranslationObject, LoadingIndicatorConfig } from '../types';
import { clearExecuteQueryCache } from '@/query/execute-query';
import { SisenseContextProviderProps } from '@/props';
import { SYSTEM_TENANT_NAME } from '@/const';

/**
 * Application configuration
 */
export type AppConfig = {
  /**
   * A [date-fns Locale](https://date-fns.org/v2.30.0/docs/Locale)
   */
  locale?: Locale;

  /**
   * Translation Configurations
   *
   * @internal
   */
  translationConfig?: {
    /**
     * Language code to be used for translations.
     *
     * @internal
     */
    language?: string;

    /**
     * Additional translation resources to be loaded.
     *
     * You can find the list of available translation keys in the translation folder of every package.
     *
     * Translation keys that are not provided will default to the English translation.
     * If translation is provided for a package other than sdk-ui, please specify the namespace property.
     *
     * Important: Do not translate parts in {{}} - these are placeholders for dynamic values and will be matched using provided variable names.
     *
     * @example
     * ```typescript
     * customTranslations: [
     *   {
     *     language: 'fr',
     *     resources: {
     *       errors: {
     *        invalidFilterType: 'Type de filtre invalide',
     *       },
     *     },
     *   },
     *   {
     *     language: 'es',
     *     namespace: 'sdkData'
     *     resources: {
     *       errors: {
     *         measure: {
     *           unsupportedType: 'Tipo de medida no compatible',
     *         },
     *       },
     *     },
     *   },
     * ]
     * ```
     */
    customTranslations?: CustomTranslationObject[];
  };

  /**
   * Language code to be used for translations
   *
   * @internal
   * @deprecated Use `translationConfig.language` instead
   */
  language?: string;

  /**
   * Date Configurations
   */
  dateConfig?: DateConfig;

  /**
   * Loading Indicator Configurations
   */
  loadingIndicatorConfig?: LoadingIndicatorConfig;

  /**
   * Query Cache Configurations
   *
   * This feature is in alpha.
   */
  queryCacheConfig?: {
    /**
     * Whether to enable query caching
     *
     * If not specified, the default value is `false`
     */
    enabled?: boolean;
  };

  /**
   * Query limit (max rows count that will be fetched in query)
   *
   * @default 20000
   */
  queryLimit?: number;

  /**
   * Accessibility configuration. Set the `accessibilityConfig.enabled` property to `true` to enable accessibility features for charts built with Highcharts.
   *
   * Once the accessibility configuration in enabled, you can use the default descriptions or choose to create custom configurations for the descriptions of a chart, its axes, its series, and values description formatting. To create custom configurations, use the `highchartsOptions` object that is passed to the {@link BeforeRenderHandler} of the chart's `onBeforeRender` callback. Modify the object using the accessibility options as described in the [Accessibility module documentation](https://www.highcharts.com/docs/accessibility/accessibility-module).
   *
   * Note that enabling accessibility also causes markers to appear in charts even if they are disabled using the chart's `styleOptions`.
   *
   * This feature is in alpha.
   */
  accessibilityConfig?: {
    /**
     * Whether to enable accessibility features
     *
     * If not specified, the default value is `false`
     */
    enabled?: boolean;
  };

  /**
   * Configuration of the tabber widget
   *
   * Set the `tabberConfig.enabled` property to `true` to enable the tabber widget support. Otherwise, the tabber widget will be treated as 'unkwon plugin type'.
   *
   * @internal
   */
  tabberConfig?: {
    /**
     * Whether to enable tabber widget support
     *
     * If not specified, the default value is `false`
     */
    enabled?: boolean;
  };
  /**
   * Configuration of the component that is rendered in case of an error
   */
  errorBoundaryConfig?: {
    /**
     * Whether to show error text without hovering over the error icon
     *
     * If not specified, the default value is `false`
     */
    alwaysShowErrorText?: boolean;
  };

  /**
   * Tracking configuration
   */
  trackingConfig?: {
    /**
     * Whether to enable or disable tracking in development or test environment.
     *
     * If not specified, the default value is `true`
     *
     * In production, tracking is always enabled.
     *
     * @internal
     */
    enabled?: boolean;
    /**
     * Callback to be invoked when tracking event occurs
     */
    onTrackingEvent?: (payload: TrackingEventDetails) => void;
  };
};

/**
 * Stands for a Sisense Client Application which connects to a Sisense Environment
 *
 * @internal
 */
export interface ClientApplication {
  /**
   * Gets the underlying HTTP Client
   */
  readonly httpClient: HttpClient;

  /**
   * Gets the underlying Pivot Client
   */
  readonly pivotClient: PivotClient;

  /**
   * Gets the underlying Query Client
   */
  readonly queryClient: QueryClient;

  /**
   * Gets the default data source being used as default for child components with no explicitly defined data source
   */
  readonly defaultDataSource?: DataSource;

  /**
   * Gets the application settings
   */
  settings: AppSettings;

  /**
   * Gets the module to control query cache
   */
  queryCache: {
    /**
     * Clears the query cache
     */
    clear: () => void;
  };
}

type ClientApplicationParams = Pick<
  SisenseContextProviderProps,
  | 'appConfig'
  | 'defaultDataSource'
  | 'url'
  | 'token'
  | 'wat'
  | 'ssoEnabled'
  | 'enableSilentPreAuth'
  | 'useFusionAuth'
>;

function getBaseUrl(url: string, tenantName: string) {
  return tenantName === SYSTEM_TENANT_NAME ? url : url.replace(`/${tenantName}`, '');
}

function normalizeErrors() {
  // todo: add unsubscribe flow
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    // TODO: replace this with custom logger
    if (event.reason instanceof Error) {
      console.error(event.reason.message);
    } else {
      console.error(event.reason);
    }
  });
}

/** @internal */
export const createClientApplication = async ({
  defaultDataSource,
  url: rawUrl,
  token,
  wat,
  ssoEnabled,
  appConfig,
  enableSilentPreAuth,
  useFusionAuth,
}: ClientApplicationParams): Promise<ClientApplication> => {
  if (rawUrl === undefined) {
    throw new TranslatableError('errors.sisenseContextNoAuthentication');
  }

  const url = normalizeUrl(rawUrl);

  const auth = getAuthenticator({
    url,
    token,
    wat,
    ssoEnabled,
    enableSilentPreAuth,
    useFusionAuth,
  });

  if (!auth) {
    throw new TranslatableError('errors.sisenseContextNoAuthentication');
  }

  normalizeErrors();

  const httpClient = new HttpClient(
    url,
    auth,
    'sdk-ui' + (__PACKAGE_VERSION__ ? `-${__PACKAGE_VERSION__}` : ''),
  );
  const loginSuccess = await httpClient.login();

  // do not fetch palette settings from server if login failed
  // SSO redirect is considered failed login as there will be another login attempt
  // TODO: Remove WAT check once the server will be able to return the palette under the WAT
  const useDefaultPalette = isWatAuthenticator(auth) || !loginSuccess;
  const settings = await getSettings(appConfig || {}, httpClient, useDefaultPalette);

  const pivotClient = new PivotClient(getBaseUrl(url, settings.user.tenant.name), auth);
  const queryClient = new DimensionalQueryClient(httpClient, pivotClient);

  const queryCache = {
    clear: clearExecuteQueryCache,
  };

  return {
    httpClient,
    pivotClient,
    queryClient,
    settings,
    // todo: make it optional (incorrect previous implementation)
    defaultDataSource: defaultDataSource,
    queryCache,
  };
};
