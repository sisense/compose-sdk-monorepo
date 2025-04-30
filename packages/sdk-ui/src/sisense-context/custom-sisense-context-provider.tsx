import { PropsWithChildren, type FunctionComponent } from 'react';
import { ThemeProvider } from '../theme-provider';
import { ErrorBoundary } from '../error-boundary/error-boundary';
import { SisenseContext, SisenseContextPayload } from './sisense-context';
import { I18nProvider } from '../translation/i18n-provider';
import { MenuProvider } from '@/common/components/menu/menu-provider';
import { SisenseQueryClientProvider } from './sisense-query-client-provider';
import { CustomContextProviderProps } from '../types';

/** @internal */
export type CustomSisenseContext = SisenseContextPayload;

/** @internal */
export type CustomSisenseContextProviderProps = CustomContextProviderProps<CustomSisenseContext>;

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
    context?.app?.settings.translationConfig.language || context?.app?.settings.serverLanguage;
  const customTranslations = context.app?.settings.translationConfig.customTranslations;

  return (
    <I18nProvider userLanguage={userLanguage} customTranslations={customTranslations}>
      <ErrorBoundary showErrorBox={context?.errorBoundary.showErrorBox} error={error}>
        {context && (
          <SisenseContext.Provider value={context}>
            <ThemeProvider skipTracking theme={context.app?.settings.serverThemeSettings}>
              <SisenseQueryClientProvider>
                <MenuProvider>{children}</MenuProvider>
              </SisenseQueryClientProvider>
            </ThemeProvider>
          </SisenseContext.Provider>
        )}
      </ErrorBoundary>
    </I18nProvider>
  );
};
