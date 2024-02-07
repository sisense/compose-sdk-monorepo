/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-params */
import { HttpClient, Authenticator, getAuthenticator } from '@sisense/sdk-rest-client';
import { DimensionalQueryClient, QueryClient } from '@sisense/sdk-query-client';
import { DataSource } from '@sisense/sdk-data';
import { SisenseContextProviderProps } from '../props';
import { DateConfig } from '../query/date-formats';
import { AppSettings, getSettings } from './settings/settings';
import { TranslatableError } from '../translation/translatable-error';
import { PivotClient } from '@sisense/sdk-pivot-client';
import { LoadingIndicatorConfig } from '../types';

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

    if (defaultDataSource !== undefined) {
      this.defaultDataSource = defaultDataSource;
    }
  }
}

/** @internal */
export const createClientApplication = async ({
  defaultDataSource,
  url,
  token,
  wat,
  ssoEnabled,
  appConfig,
  enableSilentPreAuth,
}: SisenseContextProviderProps): Promise<ClientApplication> => {
  if (url !== undefined) {
    const auth = getAuthenticator(
      url,
      undefined,
      undefined,
      token,
      wat,
      ssoEnabled,
      enableSilentPreAuth,
    );

    if (auth) {
      const app = new ClientApplication(url, auth, defaultDataSource);
      const loginSuccess = await app.httpClient.login();
      // do not fetch palette settings from server if login failed
      // SSO redirect is considered failed login as there will be another login attempt
      // TODO: Remove WAT check once the server will be able to return the palette under the WAT
      const useDefaultPalette = 'wat' in auth || !loginSuccess;
      app.settings = await getSettings(appConfig || {}, app.httpClient, useDefaultPalette);
      return app;
    }
  }

  throw new TranslatableError('errors.sisenseContextNoAuthentication');
};
