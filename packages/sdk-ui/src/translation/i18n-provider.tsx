import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useInitializedI18n } from './use-initialized-i18n';

type I18nProviderProps = {
  children: React.ReactNode;
  userLanguage?: string;
};

export const I18nProvider = ({ children, userLanguage }: I18nProviderProps) => {
  const i18n = useInitializedI18n();
  useEffect(() => {
    if (userLanguage && i18n?.language !== userLanguage) {
      void i18n?.changeLanguage(userLanguage);
    }
  }, [i18n, userLanguage]);
  return i18n && <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
