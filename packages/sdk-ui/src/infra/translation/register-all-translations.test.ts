import { describe, expect, it } from 'vitest';

import { i18nextInstance } from './initialize-i18n.js';
import { registerAllTranslations } from './register-all-translations.js';
import { PACKAGE_NAMESPACE } from './resources/index.js';

const LANGUAGES = [
  'de-DE',
  'es-AR',
  'es-ES',
  'fr-FR',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'nl-NL',
  'pt-BR',
  'ru-RU',
  'tr-TR',
  'zh-CN',
];

describe('registerAllTranslations', () => {
  it('adds every shipped locale to the i18next instance', () => {
    registerAllTranslations();

    for (const language of LANGUAGES) {
      expect(i18nextInstance.hasResourceBundle(language, PACKAGE_NAMESPACE)).toBe(true);
    }
    expect(
      i18nextInstance.getResource('de-DE', PACKAGE_NAMESPACE, 'narrativeWidget.generate'),
    ).toBe('Narrativ generieren');
  });
});
