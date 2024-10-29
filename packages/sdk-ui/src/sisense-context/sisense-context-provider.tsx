import { ClientApplication, createClientApplication } from '../app/client-application';
import { PropsWithChildren, useEffect, useState, type FunctionComponent } from 'react';
import { SisenseContextProviderProps } from '../props';
import { ThemeProvider } from '../theme-provider';
import { ErrorBoundary } from '../error-boundary/error-boundary';
import { SisenseContext } from './sisense-context';
import { I18nProvider } from '../translation/i18n-provider';
import { SisenseQueryClientProvider } from './sisense-query-client-provider';
import { isAuthTokenPending } from '@sisense/sdk-rest-client';
import { PluginsProvider } from '@/plugins-provider';
import { MenuProvider } from '@/common/components/menu/menu-provider';
import { CustomTranslationsLoader } from '@/translation/custom-translations-loader';

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
  showRuntimeErrors = true,
  enableSilentPreAuth = false,
  useFusionAuth = false,
  onError,
}) => {
  const tracking = {
    // if tracking is configured in appConfig, use it
    // if none is set, default to true
    enabled: appConfig?.trackingConfig?.enabled ?? true,
    onTrackingEvent: appConfig?.trackingConfig?.onTrackingEvent,
    packageName: 'sdk-ui',
  };
  const [app, setApp] = useState<ClientApplication | undefined>();

  const [clientApplicationError, setClientApplicationError] = useState<Error>();

  useEffect(() => {
    let ignore = false;

    // if the token is pending (not ready), wait for it to be set
    // instead of trying to create the client application and throw an error
    if (isAuthTokenPending(token, wat)) {
      console.debug('Waiting for the auth token to be set');
      return;
    }

    void createClientApplication({
      defaultDataSource,
      url,
      token,
      wat,
      ssoEnabled,
      appConfig,
      enableSilentPreAuth,
      useFusionAuth,
    })
      .then((newApp) => {
        if (!ignore) {
          setApp(newApp);
        }
      })
      .catch((asyncError: Error) => {
        onError?.(asyncError);
        console.error(asyncError);
        // set error state to trigger rerender and throw synchronous error
        setClientApplicationError(asyncError);
      });
    return () => {
      ignore = true;
    };
  }, [
    defaultDataSource,
    url,
    token,
    wat,
    ssoEnabled,
    appConfig,
    enableSilentPreAuth,
    useFusionAuth,
    onError,
  ]);

  const userLanguage =
    app?.settings.translationConfig.language ||
    app?.settings.language ||
    app?.settings.serverLanguage;

  return (
    <I18nProvider userLanguage={userLanguage}>
      <CustomTranslationsLoader
        customTranslations={app?.settings.translationConfig.customTranslations}
      >
        <ErrorBoundary showErrorBox={showRuntimeErrors} error={clientApplicationError}>
          <SisenseContext.Provider value={{ isInitialized: true, app, tracking }}>
            <ThemeProvider skipTracking theme={app?.settings.serverThemeSettings}>
              <SisenseQueryClientProvider>
                <PluginsProvider>
                  <MenuProvider>{children}</MenuProvider>
                </PluginsProvider>
              </SisenseQueryClientProvider>
            </ThemeProvider>
          </SisenseContext.Provider>
        </ErrorBoundary>
      </CustomTranslationsLoader>
    </I18nProvider>
  );
};
