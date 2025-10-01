import { inject, ref } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import { getDefaultThemeSettings, type CompleteThemeSettings } from '@ethings-os/sdk-ui-preact';

export const themeContextConfigKey = Symbol('themeContextConfigKey') as InjectionKey<
  Ref<CompleteThemeSettings>
>;

/**
 * Gets Theme context
 */
export const getThemeContext = (): Ref<CompleteThemeSettings> => {
  const treatDefaultAsFactory = true;
  return inject(themeContextConfigKey, () => ref(getDefaultThemeSettings()), treatDefaultAsFactory);
};
