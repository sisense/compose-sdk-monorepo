import {
  type CompleteThemeSettingsInternal,
  getDefaultThemeSettings,
} from '@sisense/sdk-ui-preact';
import { inject, ref } from 'vue';
import type { InjectionKey, Ref } from 'vue';

export const themeContextConfigKey = Symbol('themeContextConfigKey') as InjectionKey<
  Ref<CompleteThemeSettingsInternal>
>;

/**
 * Gets Theme context
 */
export const getThemeContext = (): Ref<CompleteThemeSettingsInternal> => {
  const treatDefaultAsFactory = true;
  return inject(themeContextConfigKey, () => ref(getDefaultThemeSettings()), treatDefaultAsFactory);
};
