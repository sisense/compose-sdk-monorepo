/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-params */
import {
  HttpClient,
  Authenticator,
  getAuthenticator,
  isWatAuthenticator,
} from '@sisense/sdk-rest-client';
import { DimensionalQueryClient, QueryClient } from '@sisense/sdk-query-client';
import { DataSource } from '@sisense/sdk-data';
import { DateConfig } from '../query/date-formats';
import { AppSettings, getSettings } from './settings/settings';
import { TranslatableError } from '../translation/translatable-error';
import { PivotClient } from '@sisense/sdk-pivot-client';
import { LoadingIndicatorConfig } from '../types';
import { clearExecuteQueryCache } from '@/query/execute-query';
import { TrackingEventDetails } from '@sisense/sdk-tracking';
import { SisenseContextProviderProps } from '@/props';

/**
 * Application configuration
 */
export type AppConfig = {
  /**
   * A [date-fns Locale](https://date-fns.org/v2.30.0/docs/Locale)
   */
  locale?: Locale;

  /**
   * Language code to be used for translations
   *
   * @internal
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
     * Whether to enable tracking
     *
     * If not specified, the default value is `true`
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
export class ClientApplication {
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
  readonly defaultDataSource: DataSource;

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

  /**
   * Construct new Sisense Client Application
   *
   * @param url - URL to the sisense environment
   * @param auth - Authentication to be used
   * @param defaultDataSource - Default data source to be used by child components by default
   */
  constructor(url: string, auth: Authenticator, defaultDataSource?: DataSource) {
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      // TODO: replace this with custom logger
      if (event.reason instanceof Error) {
        console.error(event.reason.message);
      } else {
        console.error(event.reason);
      }
    });

    this.httpClient = new HttpClient(
      url,
      auth,
      'sdk-ui' + (__PACKAGE_VERSION__ ? `-${__PACKAGE_VERSION__}` : ''),
    );
    this.pivotClient = new PivotClient(this.httpClient);
    this.queryClient = new DimensionalQueryClient(this.httpClient, this.pivotClient);

    this.queryCache = {
      clear: clearExecuteQueryCache,
    };

    if (defaultDataSource !== undefined) {
      this.defaultDataSource = defaultDataSource;
    }
  }
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

/** @internal */
export const createClientApplication = async ({
  defaultDataSource,
  url,
  token,
  wat,
  ssoEnabled,
  appConfig,
  enableSilentPreAuth,
  useFusionAuth,
}: ClientApplicationParams): Promise<ClientApplication> => {
  if (url !== undefined) {
    const auth = getAuthenticator({
      url,
      token,
      wat,
      ssoEnabled,
      enableSilentPreAuth,
      useFusionAuth,
    });

    if (auth) {
      const app = new ClientApplication(url, auth, defaultDataSource);
      const loginSuccess = await app.httpClient.login();
      // do not fetch palette settings from server if login failed
      // SSO redirect is considered failed login as there will be another login attempt
      // TODO: Remove WAT check once the server will be able to return the palette under the WAT
      const useDefaultPalette = isWatAuthenticator(auth) || !loginSuccess;
      app.settings = await getSettings(appConfig || {}, app.httpClient, useDefaultPalette);
      return app;
    }
  }

  throw new TranslatableError('errors.sisenseContextNoAuthentication');
};
