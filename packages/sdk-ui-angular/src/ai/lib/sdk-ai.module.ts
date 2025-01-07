/* eslint-disable import/no-extraneous-dependencies */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SdkUiModule } from '@sisense/sdk-ui-angular';

/**
 * SDK AI Module
 *
 * @internal
 */
@NgModule({
  declarations: [],
  imports: [CommonModule, SdkUiModule],
  exports: [],
  providers: [],
})
export class SdkAiModule {
  constructor() {
    console.log('SdkAiModule loaded');
  }
}
