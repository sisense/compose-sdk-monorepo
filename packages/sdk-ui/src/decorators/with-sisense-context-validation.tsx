import { isFunction, isBoolean } from 'lodash';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { ComponentDecorator, SisenseComponentConfig } from './as-sisense-component';
import { TranslatableError } from '../translation/translatable-error';

type SisenseContextValidationConfig = Pick<
  SisenseComponentConfig,
  'shouldSkipSisenseContextWaiting' | 'customContextErrorMessageKey'
>;

/**
 * Adds waiting for the Sisense context to be initialized
 */
export const withSisenseContextValidation: ComponentDecorator<SisenseContextValidationConfig> = ({
  shouldSkipSisenseContextWaiting,
  customContextErrorMessageKey,
}) => {
  return (Component) => {
    return (props) => {
      if (canRenderWithoutSisenseContextWaiting(shouldSkipSisenseContextWaiting, props)) {
        return <Component {...props} />;
      }
      const { app, isInitialized } = useSisenseContext();
      if (!isInitialized) {
        const errorMessageKey = customContextErrorMessageKey || 'errors.noSisenseContext';
        throw new TranslatableError(errorMessageKey);
      }
      if (!app) {
        return <LoadingIndicator />;
      }
      return <Component {...props} />;
    };
  };
};

function canRenderWithoutSisenseContextWaiting(
  shouldSkipSisenseContextWaiting: SisenseContextValidationConfig['shouldSkipSisenseContextWaiting'],
  props: Record<string, any>,
): boolean | undefined {
  return (
    (isBoolean(shouldSkipSisenseContextWaiting) && shouldSkipSisenseContextWaiting) ||
    (isFunction(shouldSkipSisenseContextWaiting) && shouldSkipSisenseContextWaiting(props))
  );
}

function LoadingIndicator() {
  // TODO: add a nice loading indicator (SNS-94466)
  return null;
}