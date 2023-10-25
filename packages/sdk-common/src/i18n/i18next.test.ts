import { PostProcessorModule } from 'i18next';
import { basicI18Next, initI18next } from './i18next.js';
import { resources } from './resources/index.js';

describe('i18next', () => {
  describe('i18nextInstance', () => {
    const i18n = basicI18Next.i18nextInstance;
    it('should have correct translations for English (en)', () => {
      const translatedMessage = i18n.t('error');
      expect(translatedMessage).toBe(resources.en.error);
    });

    it('should have correct translations for Ukrainian (uk)', async () => {
      // Change the language to Ukrainian
      await i18n.changeLanguage('uk');
      const translatedMessage = i18n.t('error');
      await i18n.changeLanguage('en');
      expect(translatedMessage).toBe(resources.uk.error);
    });
  });
  describe('initI18next', () => {
    describe("dictionary injection for some 'sdk-whatever' package", () => {
      const namespace = 'sdkWhatever';
      const resource = {
        en: {
          testMessage: 'test message',
        },
        uk: {
          testMessage: 'тестове повідомлення',
        },
      };
      const customPostProcessor: PostProcessorModule = {
        type: 'postProcessor',
        name: 'upperCase',
        process: (value: string) => value.toUpperCase(),
      };
      const initConfig = { namespace, resource, language: 'en', plugins: [customPostProcessor] };
      it('should have correct translations for English (en)', async () => {
        const i18n = await initI18next(initConfig).initPromise;
        const translatedMessage = i18n.t('testMessage');
        expect(translatedMessage).toBe(resource.en.testMessage);
      });
      it('should have correct translations for Ukrainian (uk)', async () => {
        const i18n = await initI18next(initConfig).initPromise;
        await i18n.changeLanguage('uk');
        const translatedMessage = i18n.t('testMessage');
        await i18n.changeLanguage('en');
        expect(translatedMessage).toBe(resource.uk.testMessage);
      });
      it("should be able to translate messages from the 'common' namespace", async () => {
        const i18n = await initI18next(initConfig).initPromise;
        const translatedMessage = i18n.t('common:error');
        expect(translatedMessage).toBe(resources.en.error);
      });

      it('should have correct translations for English (en) with injected plugin', async () => {
        const i18n = await initI18next(initConfig).initPromise;
        const translatedMessage = i18n.t('testMessage', { postProcess: customPostProcessor.name });
        expect(translatedMessage).toBe(resource.en.testMessage.toUpperCase());
      });
    });
  });
});
