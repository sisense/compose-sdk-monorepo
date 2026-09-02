import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { trackProductEvent } from '@sisense/sdk-tracking';
import {
  type CompleteThemeSettingsInternal,
  getDefaultThemeSettings,
  getThemeSettingsByOid,
  type ThemeProviderProps as ThemeConfig,
} from '@sisense/sdk-ui-preact';
import { BehaviorSubject, Observable, skip } from 'rxjs';
import { merge } from 'ts-deepmerge';

import packageVersion from '../../version';
import { track, TrackableService } from '../decorators/trackable.decorator';
import { type ThemeSettings } from '../sdk-ui-core-exports';
import { SisenseContextService } from './sisense-context.service';

export { type ThemeConfig };

/**
 * Token used to inject {@link ThemeConfig} into your application
 *
 * @example
 *
 * Example of injecting both {@link SisenseContextConfig} and {@link ThemeConfig} into your application:
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
 *     {
 *       provide: THEME_CONFIG_TOKEN,
 *       useValue: {
 *         // initial theme settings
 *       } as ThemeConfig,
 *     },
 *   ],
 *   bootstrap: [AppComponent],
 * })
 * ```
 * @group Contexts
 */
export const THEME_CONFIG_TOKEN = new InjectionToken<ThemeConfig>('theme configuration');

/**
 * Service for working with Sisense Fusion themes.
 *
 * If no theme service is used, the current Fusion theme is applied by default.
 *
 * @group Contexts
 */
@Injectable({
  providedIn: 'root',
})
@TrackableService<ThemeService>(['updateThemeSettings'])
export class ThemeService {
  /**
   * Current theme settings as a BehaviorSubject.
   */
  private _themeSettings$: BehaviorSubject<CompleteThemeSettingsInternal>;

  /**
   * Current theme settings as an Observable.
   *
   * @internal
   */
  readonly themeSettings$: Observable<CompleteThemeSettingsInternal>;

  private initializationPromise: Promise<void> = Promise.resolve();

  constructor(
    private sisenseContextService: SisenseContextService,
    @Optional() @Inject(THEME_CONFIG_TOKEN) themeConfig?: ThemeConfig,
  ) {
    this._themeSettings$ = new BehaviorSubject<CompleteThemeSettingsInternal>(
      getDefaultThemeSettings(),
    );
    this.themeSettings$ = this._themeSettings$.asObservable();
    this.initializationPromise = this.initThemeSettings(themeConfig?.theme);
    this.sisenseContextService
      .getApp$()
      // Skip current app value
      .pipe(skip(1))
      // Subscribe to new app values
      .subscribe({
        next: ({ app }) => {
          if (app) {
            this.initializationPromise = this.applyThemeSettings(app.settings.serverThemeSettings);
          }
        },
      });
  }

  private async initThemeSettings(theme: ThemeConfig['theme']) {
    const app = await this.sisenseContextService.getApp();

    // apply system theme settings first
    await this.applyThemeSettings(app.settings.serverThemeSettings);

    if (theme) {
      // Manually tracks theme update during initialization as execution of updateThemeSettings for consistency.
      track('sdkAngularServiceMethodExecuted', 'ThemeService.updateThemeSettings');
      await this.applyThemeSettings(theme);
    }
  }

  private async applyThemeSettings(theme: string | ThemeSettings) {
    try {
      const app = await this.sisenseContextService.getApp();
      const isThemeOid = typeof theme === 'string';
      let userThemeSettings = theme as ThemeSettings;

      if (isThemeOid) {
        userThemeSettings = await getThemeSettingsByOid(theme, app.httpClient);
      }

      const mergedThemeSettings = merge.withOptions(
        { mergeArrays: false },
        this._themeSettings$.value,
        userThemeSettings,
      ) as CompleteThemeSettingsInternal;

      this._themeSettings$.next(mergedThemeSettings);
    } catch (error) {
      // A theme that fails to load is not fatal. Erroring the subject would terminate it permanently,
      // leaving every subscriber stuck and making later `updateThemeSettings` calls no-ops. Keeping
      // the last emitted value instead means subscribers stay on the previously applied theme - the
      // server theme, or the default settings the subject was created with.
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.warn(`ThemeService: ${errorMessage}. Falling back to the current theme.`);
      void this.trackThemeError(errorMessage);
    }
  }

  /**
   * Reports a non-fatal theme loading failure to the usage analytics endpoint.
   *
   * Preserves the `sdkError` event that used to be sent indirectly: erroring the theme settings
   * subject made `CustomThemeProvider` throw, which the React `ErrorTracker` caught and reported.
   */
  private async trackThemeError(errorMessage: string) {
    try {
      const app = await this.sisenseContextService.getApp();
      const trackingEnabled = app.settings?.trackingConfig?.enabled ?? true;

      if (app?.httpClient) {
        void trackProductEvent(
          'sdkError',
          {
            packageName: 'sdk-ui-angular',
            packageVersion,
            component: 'ThemeService',
            error: errorMessage,
          },
          app.httpClient,
          !trackingEnabled,
        );
      }
    } catch (e) {
      console.warn('tracking error', e);
    }
  }

  async updateThemeSettings(theme: string | ThemeSettings) {
    await this.initializationPromise;
    await this.applyThemeSettings(theme);
  }

  /**
   * Gets the current theme settings.
   *
   * @returns The current theme settings.
   *
   * @internal
   */
  getThemeSettings(): CompleteThemeSettingsInternal {
    return this._themeSettings$.value;
  }
}
