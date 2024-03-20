import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import merge from 'ts-deepmerge';
import {
  getDefaultThemeSettings,
  getThemeSettingsByOid,
  type ThemeProviderProps as ThemeConfig,
  type CompleteThemeSettings,
} from '@sisense/sdk-ui-preact';
import { type ThemeSettings } from '../sdk-ui-core-exports';
import { SisenseContextService } from './sisense-context.service';
import { TrackableService } from '../decorators/trackable.decorator';

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
 * @group Contexts
 */
@Injectable({
  providedIn: 'root',
})
@TrackableService<ThemeService>(['updateThemeSettings'])
export class ThemeService {
  private themeSettings$: BehaviorSubject<CompleteThemeSettings>;

  constructor(
    private sisenseContextService: SisenseContextService,
    @Optional() @Inject(THEME_CONFIG_TOKEN) themeConfig?: ThemeConfig,
  ) {
    this.themeSettings$ = new BehaviorSubject<CompleteThemeSettings>(getDefaultThemeSettings());
    void this.initThemeSettings(themeConfig?.theme);
  }

  private async initThemeSettings(theme: ThemeConfig['theme']) {
    const app = await this.sisenseContextService.getApp();

    // apply system theme settings first
    await this.applyThemeSettings(app.settings.serverThemeSettings);

    if (theme) {
      await this.updateThemeSettings(theme);
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
        this.themeSettings$.value,
        userThemeSettings,
      ) as CompleteThemeSettings;

      this.themeSettings$.next(mergedThemeSettings);
    } catch (error) {
      this.themeSettings$.error(error);
    }
  }

  /** @internal */
  getThemeSettings() {
    return this.themeSettings$.asObservable();
  }

  async updateThemeSettings(theme: string | ThemeSettings) {
    await this.applyThemeSettings(theme);
  }
}
