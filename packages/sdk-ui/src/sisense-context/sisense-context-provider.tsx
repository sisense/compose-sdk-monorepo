import { ClientApplication, createClientApplication } from '../app/client-application';
import { PropsWithChildren, useEffect, useState, type FunctionComponent } from 'react';
import { SisenseContextProviderProps } from '../props';
import { ThemeProvider } from '../theme-provider';
import { ErrorBoundary } from '../error-boundary/error-boundary';
import { SisenseContext } from './sisense-context';
import { I18nProvider } from '../translation/i18n-provider';
import { SisenseQueryClientProvider } from './sisense-query-client-provider';

/**
 * Sisense Context Provider Component allowing you to connect to
 * a Sisense instance and provide that context
 * to all Compose SDK components in your application.
 *
 * @example
 * Add SisenseContextProvider to the main component of your app as below and then wrap
 * other SDK components inside this component.
 *
 * ```tsx
 * import { Chart, SisenseContextProvider } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 * import { measures } from '@sisense/sdk-data';
 *
 * function App() {
 *   return (
 *     <>
 *       <SisenseContextProvider
 *         url="<instance url>" // replace with the URL of your Sisense instance
 *         token="<api token>" // replace with the API token of your user account
 *       >
 *         <OtherComponent1/>
 *         <OtherComponent2/>
 *       </SisenseContextProvider>
 *     </>
 *   );
 * }
 *
 * export default App;
 * ```
 * @param props - Sisense context provider props
 * @returns A Sisense Context Provider Component
 * @group Contexts
 */
export const SisenseContextProvider: FunctionComponent<
  PropsWithChildren<SisenseContextProviderProps>
> = ({
  defaultDataSource,
  url,
  token,
  wat,
  ssoEnabled,
  children,
  appConfig,
  enableTracking = true,
  showRuntimeErrors = true,
  enableSilentPreAuth = false,
}) => {
  const tracking = {
    enabled: enableTracking,
    packageName: 'sdk-ui',
  };
  const [app, setApp] = useState<ClientApplication | undefined>();

  const [clientApplicationError, setClientApplicationError] = useState<Error>();

  useEffect(() => {
    let ignore = false;
    void createClientApplication({
      defaultDataSource,
      url,
      token,
      wat,
      ssoEnabled,
      appConfig,
      enableSilentPreAuth,
    })
      .then((newApp) => {
        if (!ignore) {
          setApp(newApp);
        }
      })
      .catch((asyncError: Error) => {
        // set error state to trigger rerender and throw synchronous error
        setClientApplicationError(asyncError);
      });
    return () => {
      ignore = true;
    };
  }, [defaultDataSource, url, token, wat, ssoEnabled, appConfig, enableSilentPreAuth]);

  return (
    <I18nProvider userLanguage={app?.settings.language || app?.settings.serverLanguage}>
      <ErrorBoundary showErrorBox={showRuntimeErrors} error={clientApplicationError}>
        <SisenseContext.Provider value={{ isInitialized: true, app, tracking }}>
          <ThemeProvider skipTracking theme={app?.settings.serverThemeSettings}>
            <SisenseQueryClientProvider>{children}</SisenseQueryClientProvider>
          </ThemeProvider>
        </SisenseContext.Provider>
      </ErrorBoundary>
    </I18nProvider>
  );
};
