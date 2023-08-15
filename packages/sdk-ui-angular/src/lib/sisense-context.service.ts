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
  readonly appPromise: Promise<ClientApplication | undefined>;

  constructor(@Inject(SISENSE_CONTEXT_CONFIG_TOKEN) sisenseContextConfig: SisenseContextConfig) {
    this.appPromise = createClientApplication(sisenseContextConfig);
  }
}
