import type { FunctionComponent } from 'react';

import flow from 'lodash-es/flow';

import { withDefaultTranslations } from './with-default-translations';
import { withErrorBoundary } from './with-error-boundary';
import { withMenu } from './with-menu';
import { withModal } from './with-modal';
import { withSisenseContextValidation } from './with-sisense-context-validation';
import { withTracking } from './with-tracking';

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
  /** If set, the component will have a standalone menu root, allowing the menu to be opened even when the component is used outside of the SisenseContextProvider */
  shouldHaveOwnMenuRoot?: boolean;
  /** If set, the component will have a standalone modal root, allowing modals to be opened even when the component is used outside of a ModalProvider */
  shouldHaveOwnModalRoot?: boolean;
};

export type ComponentDecorator<DecoratorConfig> = (
  decoratorConfig: DecoratorConfig,
) => <ComponentProps extends Record<string, any>>(
  Component: FunctionComponent<ComponentProps>,
) => FunctionComponent<ComponentProps>;

/**
 * Adds display name to component
 *
 * @param componentName - the display name
 * @returns component with display name
 */
const withComponentName: ComponentDecorator<string> = (componentName) => (Component) => {
  Component.displayName = componentName;
  return Component;
};

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
    trackingConfig = {},
    customContextErrorMessageKey,
    shouldHaveOwnMenuRoot,
    shouldHaveOwnModalRoot,
  } = componentConfig;
  return (Component) =>
    flow(
      withComponentName(componentName),
      withSisenseContextValidation({
        shouldSkipSisenseContextWaiting,
        customContextErrorMessageKey: customContextErrorMessageKey,
      }),
      withTracking({ componentName, config: trackingConfig }),
      withErrorBoundary({ componentName }),
      withDefaultTranslations(),
      withMenu({ shouldHaveOwnMenuRoot }),
      withModal({ shouldHaveOwnModalRoot }),
    )(Component);
};
