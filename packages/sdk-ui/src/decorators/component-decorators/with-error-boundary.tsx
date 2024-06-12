import { ErrorBoundary } from '../../error-boundary/error-boundary';
import { ComponentDecorator } from './as-sisense-component';

/**
 * Adds error boundary to the component
 */
export const withErrorBoundary: ComponentDecorator<void> = () => {
  return (Component) => {
    return function ErrorBoundaryContainer(props) {
      return (
        <ErrorBoundary resetKeys={Object.values(props)}>
          <Component {...props} />
        </ErrorBoundary>
      );
    };
  };
};
