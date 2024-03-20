import { Inject, Injectable, InjectionToken } from '@angular/core';
import { ClientApplication, createClientApplication } from '@sisense/sdk-ui-preact';
import type { SisenseContextProviderProps as SisenseContextConfig } from '@sisense/sdk-ui-preact';

export { type SisenseContextConfig };

/**
 * Token used to inject {@link SisenseContextConfig} into your application
 *
 * @example
 * Example of importing {@link SdkUiModule} and injecting {@link SisenseContextConfig} into your application:
 *
 * ```ts
 * export const SISENSE_CONTEXT_CONFIG: SisenseContextConfig = {
 *   url="<instance url>" // replace with the URL of your Sisense instance
 *   token="<api token>" // replace with the API token of your user account
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
 * Service for working with Sisense Fusion context.
 *
 * @group Contexts
 */
@Injectable({
  providedIn: 'root',
})
export class SisenseContextService {
  private appPromise: Promise<ClientApplication>;

  private config: SisenseContextConfig;

  constructor(@Inject(SISENSE_CONTEXT_CONFIG_TOKEN) sisenseContextConfig: SisenseContextConfig) {
    this.appPromise = createClientApplication(sisenseContextConfig);

    const { enableTracking, showRuntimeErrors } = sisenseContextConfig;
    this.config = {
      ...sisenseContextConfig,
      enableTracking: enableTracking ?? true,
      showRuntimeErrors: showRuntimeErrors ?? true,
    };
  }

  /** @internal */
  getApp(): Promise<ClientApplication> {
    return this.appPromise;
  }

  getConfig(): SisenseContextConfig {
    return this.config;
  }
}
