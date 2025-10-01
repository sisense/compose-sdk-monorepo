export const translation = {
  error: 'Error',
};
/**
 * A reference type containing all currently used translation keys.
 * This type serves as a complete resource for creating custom translations,
 * ensuring that all required keys are present and included.
 * It can also be used as Partial to make sure custom translation does not contain any typos.
 *
 * @example
 * ```typescript
 * import { TranslationDictionary } from '@ethings-os/sdk-common';
 *
 * const customTranslationResources: Partial<TranslationDictionary> = {
 * ```
 * @internal
 */
export type TranslationDictionary = typeof translation;
