/**
 * Common test utilities
 */
import { PropsWithChildren, ReactElement } from 'react';
import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SisenseContext, SisenseContextPayload } from '../sisense-context/sisense-context';
import { Authenticator, HttpClient } from '@sisense/sdk-rest-client';
import { ClientApplication } from '../app/client-application';

type UserSetupFn = (typeof userEvent)['setup'];
interface SetupResult extends RenderResult {
  user: ReturnType<UserSetupFn>;
}
/**
 * This helper method combines the userEvent.setup() and render() calls at the
 * start of a unit test using @testing-library/react.
 *
 * Based on recommendation by: https://testing-library.com/docs/user-event/intro/#writing-tests-with-userevent
 *
 * @param jsx - React component instance to test, passed directly to render()
 * @param useFakeTimers - true if Vitest fake timers are enabled
 * @returns
 */
export function setup(jsx: ReactElement, useFakeTimers = false): SetupResult {
  return {
    // Need to set "advanceTimers" if we're using Vitest's fake timers.
    // The solution in https://github.com/testing-library/user-event/issues/833#issuecomment-1171452841
    // is for Jest, but this seems to work for Vitest as well.
    user: userEvent.setup(
      useFakeTimers ? { advanceTimers: (ms) => vi.advanceTimersByTime(ms) } : undefined,
    ),
    ...render(jsx),
  };
}

export const MockedHighchartsWrapper = ({
  options,
}: {
  /**
   * Highcharts chart configuration object.
   * Please refer to the Highcharts (API documentation)[https://api.highcharts.com/highcharts/].
   */
  options: object;
}) => {
  return <div>{JSON.stringify(options)}</div>;
};

const mockHttpClient = new HttpClient('mock-url', {} as Authenticator, 'mock-env');
export const MockedSisenseContextProvider = ({
  children,
  enableTracking = true,
  isInitialized = true,
}: PropsWithChildren<Partial<Omit<SisenseContextPayload, 'app'>>>) => {
  return (
    <SisenseContext.Provider
      value={{
        app: {
          httpClient: mockHttpClient,
        } as ClientApplication,
        enableTracking,
        isInitialized,
      }}
    >
      {children}
    </SisenseContext.Provider>
  );
};
