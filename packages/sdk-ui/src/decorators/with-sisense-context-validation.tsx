import { isFunction, isBoolean } from 'lodash';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { ComponentDecorator, SisenseComponentConfig } from './as-sisense-component';

type SisenseContextValidationConfig = Pick<
  SisenseComponentConfig,
  'shouldSkipSisenseContextWaiting'
>;

/**
 * Adds waiting for the Sisense context to be initialized
 */
export const withSisenseContextValidation: ComponentDecorator<SisenseContextValidationConfig> = ({
  shouldSkipSisenseContextWaiting,
}) => {
  return (Component) => {
    return (props) => {
      if (
        (isBoolean(shouldSkipSisenseContextWaiting) && shouldSkipSisenseContextWaiting) ||
        (isFunction(shouldSkipSisenseContextWaiting) && shouldSkipSisenseContextWaiting(props))
      ) {
        return <Component {...props} />;
      }
      const { app, isInitialized } = useSisenseContext();
      if (!isInitialized) {
        throw new Error('Sisense context is not initialized');
      }
      if (!app) {
        return <LoadingIndicator />;
      }
      return <Component {...props} />;
    };
  };
};

function LoadingIndicator() {
  // TODO: add a nice loading indicator (SNS-94466)
  return null;
}
