import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import merge from 'ts-deepmerge';
import {
  getDefaultThemeSettings,
  getThemeSettingsByOid,
  type ThemeProviderProps as ThemeConfig,
  type CompleteThemeSettings,
  type ThemeSettings,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from './sisense-context.service';

export { type ThemeConfig };
export const THEME_CONFIG_TOKEN = new InjectionToken<ThemeConfig>('theme configuration');

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private themeSettings$: BehaviorSubject<CompleteThemeSettings> =
    new BehaviorSubject<CompleteThemeSettings>(getDefaultThemeSettings());

  constructor(
    private sisenseContextService: SisenseContextService,
    @Optional() @Inject(THEME_CONFIG_TOKEN) themeConfig?: ThemeConfig,
  ) {
    void this.initThemeSettings(themeConfig?.theme);
  }

  private async initThemeSettings(theme: ThemeConfig['theme']) {
    const app = await this.sisenseContextService.getApp();

    // apply system theme settings first
    await this.applyThemeSettings(app.settings.serverThemeSettings);

    if (theme) {
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
        this.themeSettings$.value,
        userThemeSettings,
      ) as CompleteThemeSettings;

      this.themeSettings$.next(mergedThemeSettings);
    } catch (error) {
      this.themeSettings$.error(error);
    }
  }

  getThemeSettings() {
    return this.themeSettings$.asObservable();
  }

  async updateThemeSettings(theme: string | ThemeSettings) {
    await this.applyThemeSettings(theme);
  }
}
