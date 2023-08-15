/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-params */
import { HttpClient, Authenticator, getAuthenticator } from '@sisense/sdk-rest-client';
import { DimensionalQueryClient, QueryClient } from '@sisense/sdk-query-client';
import { DataSource } from '@sisense/sdk-data';
import { SisenseContextProviderProps } from '../props';
import { DateConfig, defaultDateConfig } from '../query/date-formats';
import merge from 'ts-deepmerge';
import { getBaseDateFnsLocale } from '../chart-data-processor/data_table_date_period';
import { translation } from '../locales/en';

/**
 * Application configuration
 */
export type AppConfig = {
  /**
   * A [date-fns Locale](https://date-fns.org/v2.30.0/docs/Locale)
   */
  locale: Locale;

  /**
   * Date Configurations
   */
  dateConfig: DateConfig;
};

const defaultAppConfig = { locale: getBaseDateFnsLocale(), dateConfig: defaultDateConfig };

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
   * Gets the application configuration
   */
  readonly appConfig: AppConfig;

  /**
   * Construct new Sisense Client Application
   *
   * @param url - URL to the sisense environment
   * @param auth - Authentication to be used
   * @param defaultDataSource - Default data source to be used by child components by default
   * @param appConfig - Application configuration
   */
  constructor(
    url: string,
    auth: Authenticator,
    defaultDataSource?: DataSource,
    appConfig?: AppConfig,
  ) {
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

    this.appConfig = merge(defaultAppConfig, appConfig ?? {});

    if (defaultDataSource !== undefined) {
      this.defaultDataSource = defaultDataSource;
    }
  }
}

/** @internal */
export const createClientApplication = async ({
  defaultDataSource,
  url,
  username,
  password,
  token,
  wat,
  ssoEnabled,
  appConfig,
}: SisenseContextProviderProps): Promise<ClientApplication | undefined> => {
  if (url !== undefined) {
    const auth = getAuthenticator(url, username, password, token, wat, ssoEnabled);

    if (auth) {
      const app = new ClientApplication(url, auth, defaultDataSource, appConfig);
      await app.httpClient.login();

      return app;
    }
  }

  throw Error(translation.errors.sisenseContextNoAuthentication);
};
