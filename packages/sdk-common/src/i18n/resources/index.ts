import { translation as enDictionary, TranslationDictionary } from './en.js';
import { translation as ukDictionary } from './uk.js';

export type { TranslationDictionary };
export const PACKAGE_NAMESPACE = 'common' as const;
export const resources = {
  en: enDictionary,
  uk: ukDictionary,
};
