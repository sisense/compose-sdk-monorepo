import isBoolean from 'lodash-es/isBoolean';
import isFunction from 'lodash-es/isFunction';

import { LoadingIndicator } from '@/common/components/loading-indicator';

import { useSisenseContext } from '../../sisense-context/sisense-context';
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
      if (canRenderWithoutSisenseContextWaiting(shouldSkipSisenseContextWaiting, props)) {
        return <Component {...props} />;
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
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
