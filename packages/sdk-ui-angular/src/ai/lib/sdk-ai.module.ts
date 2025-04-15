/* eslint-disable import/no-extraneous-dependencies */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SdkUiModule } from '@sisense/sdk-ui-angular';

import { ChatbotComponent, GetNlgInsightsComponent } from './components';

/**
 * SDK AI Module, which is a container for generative AI components and services.
 *
 * @example
 * Example of importing {@link SdkAiModule} and injecting {@link AiContextConfig} into your application,
 * along with importing dependency {@link SdkUiModule} and injecting {@link SisenseContextConfig} to connect to a Sisense instance:
 *
 * ```ts
 * import { SdkUiModule, SisenseContextConfig } from '@sisense/sdk-ui-angular';
 * import { SdkAiModule, AI_CONTEXT_CONFIG_TOKEN, AiContextConfig } from '@sisense/sdk-ui-angular/ai';
 *
 * const AI_CONTEXT_CONFIG: AiContextConfig = {
 *   volatile: true,
 * };
 * const SISENSE_CONTEXT_CONFIG: SisenseContextConfig = {
 *   url: "<instance url>", // replace with the URL of your Sisense instance
 *   token: "<api token>", // replace with the API token of your user account
 *   defaultDataSource: DM.DataSource,
 * };
 *
 * @NgModule({
 *   imports: [
 *     BrowserModule,
 *     SdkUiModule,
 *     SdkAiModule,
 *   ],
 *   declarations: [AppComponent],
 *   providers: [
 *     { provide: AI_CONTEXT_CONFIG_TOKEN, useValue: AI_CONTEXT_CONFIG },
 *     { provide: SISENSE_CONTEXT_CONFIG_TOKEN, useValue: SISENSE_CONTEXT_CONFIG },
 *   ],
 *   bootstrap: [AppComponent],
 * })
 * ```
 * @group Generative AI
 * @beta
 */
@NgModule({
  declarations: [ChatbotComponent, GetNlgInsightsComponent],
  imports: [CommonModule, SdkUiModule],
  exports: [ChatbotComponent, GetNlgInsightsComponent],
  providers: [],
})
export class SdkAiModule {
  constructor() {
    console.log('SdkAiModule loaded');
  }
}
