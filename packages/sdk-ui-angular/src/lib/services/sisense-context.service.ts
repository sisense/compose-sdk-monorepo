import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import type { SisenseContextProviderProps as SisenseContextConfig } from '@ethings-os/sdk-ui-preact';
import { ClientApplication, createClientApplication } from '@ethings-os/sdk-ui-preact';
import { concat, firstValueFrom, Observable, of, ReplaySubject } from 'rxjs';

export { type SisenseContextConfig };

/**
 * Represents the state of the Sisense client application.
 */
type AppState =
  | {
      /** Successfully initialized client application */
      readonly app: ClientApplication;
      readonly error?: never;
    }
  | {
      /** Error that occurred during initialization or connection */
      readonly error: Error;
      readonly app?: never;
    };

/**
 * Token used to inject {@link SisenseContextConfig} into your application
 *
 * @example
 * Example of importing {@link SdkUiModule} and injecting {@link SisenseContextConfig} into your application:
 *
 * ```ts
 * export const SISENSE_CONTEXT_CONFIG: SisenseContextConfig = {
 *   url: "<instance url>", // replace with the URL of your Sisense instance
 *   token: "<api token>", // replace with the API token of your user account
 *   defaultDataSource: DM.DataSource,
 * };
 *
 * @NgModule({
 *   imports: [
 *     BrowserModule,
 *     SdkUiModule,
 *   ],
 *   declarations: [AppComponent],
 *   providers: [
 *     { provide: SISENSE_CONTEXT_CONFIG_TOKEN, useValue: SISENSE_CONTEXT_CONFIG },
 *   ],
 *   bootstrap: [AppComponent],
 * })
 * ```
 * @group Contexts
 */
export const SISENSE_CONTEXT_CONFIG_TOKEN = new InjectionToken<SisenseContextConfig>(
  'Props for connecting to Sisense instance',
);

/**
 * Service for managing Sisense Fusion context and client application lifecycle.
 *
 * This service provides a centralized way to configure and manage the connection to a Sisense instance within Angular applications.
 *
 * @group Contexts
 */
@Injectable({
  providedIn: 'root',
})
export class SisenseContextService {
  /**
   * Reactive stream of application state changes.
   *
   * Uses ReplaySubject to ensure late subscribers receive the latest state.
   */
  private readonly app$: ReplaySubject<AppState>;

  /**
   * Configuration object for the Sisense connection.
   *
   * This is set once during initialization and remains readonly thereafter
   * to prevent accidental mutations that could lead to inconsistent state.
   */
  private config?: SisenseContextConfig;

  /**
   * Flag indicating whether the service has been initialized with configuration.
   *
   * @internal
   */
  isInitialized = false;

  constructor(
    @Optional() @Inject(SISENSE_CONTEXT_CONFIG_TOKEN) sisenseContextConfig?: SisenseContextConfig,
  ) {
    // The buffer size of 1 ensures only the most recent state is cached.
    this.app$ = new ReplaySubject(1);

    if (sisenseContextConfig) {
      // Auto-configure if config is provided via DI
      void this.setConfig(sisenseContextConfig);
    }
  }

  /**
   * Retrieves the initialized Sisense client application.
   *
   * This method provides access to the client application instance.
   * It waits for the latest state from the reactive stream and either returns
   * the application or throws the error if initialization failed.
   *
   * @returns Promise that resolves to the ClientApplication instance
   * @throws {Error} When the service is not initialized or when application creation failed
   *
   * @internal
   */
  async getApp(): Promise<ClientApplication> {
    if (!this.isInitialized) {
      throw new Error('Sisense context is not initialized');
    }

    const { app, error } = await firstValueFrom(this.app$);

    if (error) {
      throw error;
    }
    return app;
  }

  /**
   * Provides reactive access to the Sisense application state.
   *
   * This method returns an Observable that emits the current application state
   * and all subsequent state changes. It's the preferred way to reactively
   * handle application lifecycle events in Angular components.
   *
   * If the service is not initialized, it immediately emits an error state
   * followed by any future state changes once initialization occurs.
   *
   * @returns Observable stream of AppState changes
   *
   * @internal
   */
  getApp$(): Observable<AppState> {
    if (!this.isInitialized) {
      return concat(
        of({ error: new Error('Sisense context is not initialized') } as const),
        this.app$,
      );
    }

    return this.app$;
  }

  /**
   * Retrieves the current {@link SisenseContextConfig} configuration object.
   *
   * @returns The current configuration object, or undefined if not yet configured
   */
  getConfig(): SisenseContextConfig | undefined {
    return this.config;
  }

  /**
   * Configures and initializes the Sisense context with the provided settings.
   *
   * This method allows to establish a connection to a Sisense instance.
   * It could be used as runtime alternative to {@link SISENSE_CONTEXT_CONFIG_TOKEN} based configuration.
   *
   * @param config - Configuration object
   * @returns Promise that resolves when configuration is complete (success or failure)
   *
   * @example
   * Basic configuration:
   * ```ts
   * await SisenseContextService.setConfig({
   *   url: 'https://your-sisense-instance.com',
   *   token: 'your-api-token',
   *   defaultDataSource: 'Sample ECommerce'
   * });
   * ```
   */
  async setConfig(config: SisenseContextConfig): Promise<void> {
    this.config = {
      ...config,
      showRuntimeErrors: config.showRuntimeErrors ?? true,
    };
    this.isInitialized = true;

    try {
      const app = await createClientApplication(this.config);
      this.app$.next({ app } as const);
    } catch (error) {
      this.app$.next({ error: error as Error } as const);
    }
  }
}
