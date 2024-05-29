import type { FunctionComponent } from 'react';
import flow from 'lodash/flow';
import { withTracking } from './with-tracking';
import { withErrorBoundary } from './with-error-boundary';
import { withSisenseContextValidation } from './with-sisense-context-validation';
import { withDefaultTranslations } from './with-default-translations';

/**
 * Configuration for the {@link asSisenseComponent} decorator
 */
export type SisenseComponentConfig = {
  /** The name of the component to be used in the tracking events and error messages */
  componentName: string;
  /** If set to true (or function returns true), the component will not wait for the Sisense context to be initialized */
  shouldSkipSisenseContextWaiting?: boolean | ((props: any) => boolean);
  trackingConfig?: {
    /** If set to true (or function returns true), the component will not be tracked */
    skip?: boolean | ((props: any) => boolean);
    /** If set to true, children will be tracked too */
    transparent?: boolean;
  };
  /** If set, the error message for wrong SisenseContext will be overridden with the provided key */
  customContextErrorMessageKey?: string;
};

export type ComponentDecorator<DecoratorConfig> = (
  decoratorConfig: DecoratorConfig,
) => <ComponentProps extends Record<string, any>>(
  Component: FunctionComponent<ComponentProps>,
) => FunctionComponent<ComponentProps>;

/**
 * Decorator that adds sisense-specific functionality to a component
 *
 * @param componentConfig - component configuration
 * @returns A component with sisense-specific functionality
 */
export const asSisenseComponent: ComponentDecorator<SisenseComponentConfig> = (componentConfig) => {
  const {
    componentName,
    shouldSkipSisenseContextWaiting,
    trackingConfig,
    customContextErrorMessageKey,
  } = componentConfig;
  return (Component) =>
    flow(
      withSisenseContextValidation({
        shouldSkipSisenseContextWaiting,
        customContextErrorMessageKey: customContextErrorMessageKey,
      }),
      withTracking({ componentName, config: trackingConfig || {} }),
      withErrorBoundary(),
      withDefaultTranslations(),
    )(Component);
};
