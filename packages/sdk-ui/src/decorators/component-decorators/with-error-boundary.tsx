import { useSisenseContext } from '@/sisense-context/sisense-context';
import { ErrorBoundary } from '../../error-boundary/error-boundary';
import { ComponentDecorator } from './as-sisense-component';

/**
 * Adds error boundary to the component
 */
export const withErrorBoundary: ComponentDecorator<void> = () => {
  return (Component) => {
    return function ErrorBoundaryContainer(props) {
      const context = useSisenseContext();
      const shouldErrorBoxBeShown = context.errorBoundary.showErrorBox;
      return (
        <ErrorBoundary resetKeys={Object.values(props)} showErrorBox={shouldErrorBoxBeShown}>
          <Component {...props} />
        </ErrorBoundary>
      );
    };
  };
};
