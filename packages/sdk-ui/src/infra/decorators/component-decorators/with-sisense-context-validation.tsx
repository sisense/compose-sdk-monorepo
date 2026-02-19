import isBoolean from 'lodash-es/isBoolean';
import isFunction from 'lodash-es/isFunction';

import { LoadingOverlay } from '@/shared/components/loading-overlay';

import { useSisenseContext } from '../../../infra/contexts/sisense-context/sisense-context';
import { TranslatableError } from '../../translation/translatable-error';
import { ComponentDecorator, SisenseComponentConfig } from './as-sisense-component';

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
    return function SisenseContextValidation(props) {
      const { app, isInitialized } = useSisenseContext();
      if (canRenderWithoutSisenseContextWaiting(shouldSkipSisenseContextWaiting, props)) {
        return <Component {...props} />;
      }
      if (!isInitialized) {
        const errorMessageKey = customContextErrorMessageKey || 'errors.noSisenseContext';
        throw new TranslatableError(errorMessageKey);
      }
      if (!app) {
        return <LoadingOverlay isVisible={true} />;
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
