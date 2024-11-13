import { translation as enDictionary, TranslationDictionary } from './en.js';
import { translation as ukDictionary } from './uk.js';

export type { TranslationDictionary };
/**
 * A reference to the namespace of the translation resources.
 * This namespace is used to access the translation resources in the i18next instance.
 *
 * @internal
 */
export const PACKAGE_NAMESPACE = 'sdkData' as const;
export const resources = {
  en: enDictionary,
  uk: ukDictionary,
};
