import { PropsWithChildren } from 'react';

import { asSisenseComponent } from '../../../infra/decorators/component-decorators/as-sisense-component';
import { CompleteThemeSettings, CustomContextProviderProps } from '../../../types';
import { ThemeContext } from './theme-context';

/** @internal */
export type CustomThemeProviderProps = CustomContextProviderProps<{
  themeSettings: CompleteThemeSettings;
  skipTracking?: boolean;
}>;

/**
 * Custom Theme Provider component that allows passing external theme context.
 *
 * Note: it specifically designed to serve as a bridge for passing context between an external wrapper and child React components.
 *
 * @internal
 */
export const CustomThemeProvider = asSisenseComponent({
  componentName: 'CustomThemeProvider',
  trackingConfig: {
    skip: (props: CustomThemeProviderProps) => !!props.context?.skipTracking,
    transparent: true,
  },
  shouldSkipSisenseContextWaiting: true,
})((props: PropsWithChildren<CustomThemeProviderProps>) => {
  const { context, error, children } = props;

  if (error) {
    throw error;
  }

  const { themeSettings } = context;

  return (
    <>
      {themeSettings && (
        <ThemeContext.Provider value={{ themeSettings }}>{children}</ThemeContext.Provider>
      )}
    </>
  );
});
