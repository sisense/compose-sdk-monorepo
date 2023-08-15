/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
  SdkModule,
  SISENSE_CONTEXT_CONFIG_TOKEN,
  type SisenseContextConfig,
} from '@sisense/sdk-ui-angular';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { SettingsComponent } from './settings/settings.component';

import * as DM from '../assets/sample-healthcare-model';

export const SISENSE_CONTEXT_CONFIG: SisenseContextConfig = {
  url: 'http://10.177.10.79:30845/',
  username: 'admin@sisense.com',
  password: 'sisense',
  defaultDataSource: DM.DataSource,
};

@NgModule({
  imports: [
    BrowserModule,
    SdkModule,
    RouterModule.forRoot([
      { path: '', component: AnalyticsComponent },
      { path: 'settings', component: SettingsComponent },
    ]),
  ],
  declarations: [AppComponent, TopBarComponent, AnalyticsComponent, SettingsComponent],
  providers: [{ provide: SISENSE_CONTEXT_CONFIG_TOKEN, useValue: SISENSE_CONTEXT_CONFIG }],
  bootstrap: [AppComponent],
})
export class AppModule {}
