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
    this.queryClient = new DimensionalQueryClient(this.httpClient);

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
}: SisenseContextProviderProps): Promise<ClientApplication> => {
  if (url !== undefined) {
    const auth = getAuthenticator(url, undefined, undefined, token, wat, ssoEnabled);

    if (auth) {
      const app = new ClientApplication(url, auth, defaultDataSource);
      await app.httpClient.login();
      app.settings = await getSettings(appConfig || {}, app.httpClient, 'wat' in auth);
      return app;
    }
  }

  throw new TranslatableError('errors.sisenseContextNoAuthentication');
};
