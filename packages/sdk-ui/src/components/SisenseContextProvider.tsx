import { ClientApplication, createClientApplication } from '../app/client-application';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
  type FunctionComponent,
} from 'react';
import { SisenseContextProviderProps } from '../props';
import { ThemeProvider } from './ThemeProvider';
import { DisconnectedErrorBoundary } from './ErrorBoundary/DisconnectedErrorBoundary';

export type SisenseContextPayload = {
  isInitialized: boolean;
  app?: ClientApplication;
  enableTracking: boolean;
};

export const SisenseContext = createContext<SisenseContextPayload>({
  isInitialized: false,
  enableTracking: true,
});
export const useSisenseContext = () => useContext(SisenseContext);

/**
 * @internal
 */
export const UnwrappedSisenseContextProvider: FunctionComponent<
  PropsWithChildren<SisenseContextProviderProps>
> = ({
  defaultDataSource,
  url,
  username,
  password,
  token,
  wat,
  ssoEnabled,
  children,
  appConfig,
  enableTracking = true,
}) => {
  const [app, setApp] = useState<ClientApplication | undefined>();

  const [error, setError] = useState<Error>();
  if (error) {
    throw error;
  }

  useEffect(() => {
    void createClientApplication({
      defaultDataSource,
      url,
      username,
      password,
      token,
      wat,
      ssoEnabled,
      appConfig,
    })
      .then(setApp)
      .catch((asyncError: Error) => {
        // set error state to trigger rerender and throw synchronous error
        setError(asyncError);
      });
  }, [defaultDataSource, url, username, password, token, wat, ssoEnabled, appConfig]);

  return (
    <SisenseContext.Provider value={{ isInitialized: true, app, enableTracking }}>
      <ThemeProvider skipTracking>{children}</ThemeProvider>
    </SisenseContext.Provider>
  );
};

/**
 * Sisense Context Provider Component, which allows you to connect to
 * a Sisense instance and provide that Sisense context
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
 */
export const SisenseContextProvider: FunctionComponent<
  PropsWithChildren<SisenseContextProviderProps>
> = (props) => {
  const { showRuntimeErrors = true } = props;
  return (
    <DisconnectedErrorBoundary showErrorBox={showRuntimeErrors}>
      <UnwrappedSisenseContextProvider {...props} />
    </DisconnectedErrorBoundary>
  );
};
