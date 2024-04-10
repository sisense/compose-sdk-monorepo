import { PropsWithChildren } from 'react';
import { CompleteThemeSettings } from '../types';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { ThemeContext } from './theme-context';

/** @internal */
export type CustomThemeProviderProps = {
  context: {
    themeSettings: CompleteThemeSettings;
    skipTracking?: boolean;
  };
  error?: Error;
};

/**
 * Custom Theme Provider component that allows passing external theme context.
 *
 * Note: it specifically designed to serve as a bridge for passing context between an external wrapper and child React components.
 *
 * @internal
 */
export const CustomThemeProvider = asSisenseComponent({
  componentName: 'CustomThemeProvider',
  shouldSkipTracking: (props: CustomThemeProviderProps) => !!props.context?.skipTracking,
  shouldSkipSisenseContextWaiting: true,
})((props: PropsWithChildren<CustomThemeProviderProps>) => {
  const {
    context: { themeSettings },
    error,
    children,
  } = props;

  if (error) {
    throw error;
  }

  return (
    <>
      {themeSettings && (
        <ThemeContext.Provider value={{ themeSettings }}>{children}</ThemeContext.Provider>
      )}
    </>
  );
});
