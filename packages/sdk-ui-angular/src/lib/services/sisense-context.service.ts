import { Inject, Injectable, InjectionToken } from '@angular/core';
import { ClientApplication, createClientApplication } from '@sisense/sdk-ui-preact';
import type { SisenseContextProviderProps as SisenseContextConfig } from '@sisense/sdk-ui-preact';

export { type SisenseContextConfig };
export const SISENSE_CONTEXT_CONFIG_TOKEN = new InjectionToken<SisenseContextConfig>(
  'props for authenticating with Sisense app',
);

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

  getApp(): Promise<ClientApplication> {
    return this.appPromise;
  }

  getConfig(): SisenseContextConfig {
    return this.config;
  }
}
