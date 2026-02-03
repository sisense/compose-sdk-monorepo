import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

import { ErrorBoundary } from '../../error-boundary/error-boundary';
import { ComponentDecorator } from './as-sisense-component';

/**
 * Adds error boundary to the component
 */
export const withErrorBoundary: ComponentDecorator<{
  componentName: string;
}> = ({ componentName }) => {
  return (Component) => {
    return function ErrorBoundaryContainer(props) {
      const context = useSisenseContext();
      const extendedOnError = (error: Error) =>
        context.errorBoundary.onError?.(error, {
          componentName,
          componentProps: props,
        });
      return (
        <ErrorBoundary
          resetKeys={Object.values(props)}
          showErrorBox={context.errorBoundary.showErrorBox}
          onError={extendedOnError}
          isContainerComponent={!!props?.children}
        >
          <Component {...props} />
        </ErrorBoundary>
      );
    };
  };
};
