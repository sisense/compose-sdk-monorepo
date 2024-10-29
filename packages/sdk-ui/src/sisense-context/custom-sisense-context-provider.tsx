import { PropsWithChildren, type FunctionComponent } from 'react';
import { ThemeProvider } from '../theme-provider';
import { ErrorBoundary } from '../error-boundary/error-boundary';
import { SisenseContext, SisenseContextPayload } from './sisense-context';
import { I18nProvider } from '../translation/i18n-provider';
import { MenuProvider } from '@/common/components/menu/menu-provider';
import { CustomTranslationsLoader } from '@/translation/custom-translations-loader';

/** @internal */
export type CustomSisenseContext = SisenseContextPayload & {
  showRuntimeErrors: boolean;
};

/** @internal */
export type CustomSisenseContextProviderProps = {
  context?: CustomSisenseContext;
  error?: Error;
};

/**
 * Custom Sisense Context Provider component that allows passing external context.
 *
 * Note: it specifically designed to serve as a bridge for passing context between an external wrapper and child React components.
 *
 * @internal
 */
export const CustomSisenseContextProvider: FunctionComponent<
  PropsWithChildren<CustomSisenseContextProviderProps>
> = ({ context, error, children }) => {
  if (!context)
    return (
      <ErrorBoundary showErrorBox={false} error={error}>
        <I18nProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </ErrorBoundary>
    );

  const userLanguage =
    context?.app?.settings.translationConfig.language ||
    context?.app?.settings.language ||
    context?.app?.settings.serverLanguage;

  return (
    <I18nProvider userLanguage={userLanguage}>
      <CustomTranslationsLoader
        customTranslations={context.app?.settings.translationConfig.customTranslations}
      >
        <ErrorBoundary showErrorBox={context?.showRuntimeErrors} error={error}>
          {context && (
            <SisenseContext.Provider value={context}>
              <ThemeProvider skipTracking theme={context.app?.settings.serverThemeSettings}>
                <MenuProvider>{children}</MenuProvider>
              </ThemeProvider>
            </SisenseContext.Provider>
          )}
        </ErrorBoundary>
      </CustomTranslationsLoader>
    </I18nProvider>
  );
};
