/**
 * Common test utilities
 */
import { PropsWithChildren, ReactElement } from 'react';
import { render, RenderResult } from '@testing-library/react';
import type { Cell, Data } from '@ethings-os/sdk-data';
import isObject from 'lodash-es/isObject';
import userEvent from '@testing-library/user-event';
import { SisenseContext, SisenseContextPayload } from '../sisense-context/sisense-context';
import { Authenticator, HttpClient } from '@ethings-os/sdk-rest-client';
import { ClientApplication } from '../app/client-application';
import { DeepPartial } from 'ts-essentials';
import { useTranslation } from 'react-i18next';
import { translation } from '../translation/resources/en';
import { CustomWidgetsProvider } from '../custom-widgets-provider';
import { MenuProvider } from '@/common/components/menu/menu-provider';

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

export const MockedHighchartsReact = ({
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

type MockedSisenseContextProviderProps = PropsWithChildren<
  DeepPartial<Omit<SisenseContextPayload, 'app'>>
>;

const mockHttpClient = new HttpClient(
  'http://mock-url/sometenant?someparam=true',
  {} as Authenticator,
  'mock-env',
);
export const MockedSisenseContextProvider = ({
  children,
  tracking = {
    enabled: true,
  },
  isInitialized = true,
  errorBoundary,
}: MockedSisenseContextProviderProps) => {
  return (
    <SisenseContext.Provider
      value={{
        app: {
          httpClient: mockHttpClient,
        } as ClientApplication,
        tracking: {
          enabled: tracking.enabled ?? true,
          packageName: tracking.packageName ?? 'sdk-ui',
        },
        isInitialized,
        errorBoundary: { showErrorBox: true, ...errorBoundary },
      }}
    >
      <MenuProvider>
        <CustomWidgetsProvider>{children}</CustomWidgetsProvider>
      </MenuProvider>
    </SisenseContext.Provider>
  );
};

/**
 * Extends the provided data by blurring specified rows.
 *
 * @param {Data} data - The original data object.
 * @param {number[]} blurRowsIndexes - An array of row indexes to be blurred.
 * @returns {Data} The data object with blurred rows.
 */
export const withBlurredRows = (data: Data, blurRowsIndexes: number[]) => ({
  ...data,
  rows: data.rows.map((row, rowIndex) =>
    row.map((value) => {
      const cell: Cell = isObject(value) ? value : { data: value };

      if (blurRowsIndexes.includes(rowIndex)) {
        return { ...cell, blur: true };
      }
      return cell;
    }),
  ),
});

/**
 * Mocking the i18next translation functionality for tests.
 */
export const setupI18nMock = () => {
  vi.mock('react-i18next', async () => {
    const original: { useTranslation: typeof useTranslation } = await vi.importActual(
      'react-i18next',
    );

    // Helper function to get nested translations safely
    const getNestedTranslation = (key: string): string | undefined => {
      return key.split('.').reduce((accumulator: any, currentKey: string) => {
        if (accumulator && typeof accumulator === 'object' && currentKey in accumulator) {
          return accumulator[currentKey];
        }
        return undefined;
      }, translation) as string | undefined;
    };

    return {
      ...original,
      useTranslation: () => ({
        ...original.useTranslation(),
        t: vi.fn((key, options?: Record<string, any>) => {
          const translatedValue = getNestedTranslation(key);
          if (translatedValue && options) {
            // Replace variables in the translated string
            return translatedValue.replace(/{{(.*?)}}/g, (_, varName) => {
              const trimmedVarName = varName.trim();
              return options[trimmedVarName] || `{{${trimmedVarName}}}`; // Fallback if variable is not found
            });
          }
          return translatedValue ?? key; // Fallback to the key if translation is not found
        }),
      }),
    };
  });
};
