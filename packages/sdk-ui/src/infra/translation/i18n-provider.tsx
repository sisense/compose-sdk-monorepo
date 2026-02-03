import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

import { CustomTranslationObject } from '../../types';
import { useInitializedI18n } from './use-initialized-i18n';

type I18nProviderProps = {
  children: React.ReactNode;
  userLanguage?: string;
  customTranslations?: (CustomTranslationObject | CustomTranslationObject[])[];
};

export const I18nProvider = ({
  children,
  userLanguage,
  customTranslations = [],
}: I18nProviderProps) => {
  const i18n = useInitializedI18n();
  useEffect(() => {
    if (userLanguage && i18n?.language !== userLanguage) {
      for (const { language, resources, namespace = 'sdkUi' } of customTranslations.flat()) {
        i18n?.addResourceBundle(language, namespace, resources);
      }
      void i18n?.changeLanguage(userLanguage);
    }
  }, [i18n, userLanguage, customTranslations]);
  return i18n && <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
