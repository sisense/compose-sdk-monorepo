import { useTrackComponentInit, TrackingContextProvider } from './use-track-component-init';
import { ComponentDecorator } from '../as-sisense-component';
import { isBoolean, isFunction } from 'lodash';
import { ErrorTracker } from './error-tracker';

type TrackingDecoratorConfig = {
  componentName: string;
  shouldSkipTracking?: boolean | ((props: any) => boolean);
};

/**
 * Adds tracking to the component
 */
export const withTracking: ComponentDecorator<TrackingDecoratorConfig> = ({
  componentName,
  shouldSkipTracking,
}) => {
  return (Component) => {
    return (props) => {
      if (
        (isBoolean(shouldSkipTracking) && shouldSkipTracking) ||
        (isFunction(shouldSkipTracking) && shouldSkipTracking(props))
      ) {
        return <Component {...props} />;
      }
      useTrackComponentInit(componentName, props);
      return (
        <TrackingContextProvider>
          <ErrorTracker componentName={componentName}>
            <Component {...props} />
          </ErrorTracker>
        </TrackingContextProvider>
      );
    };
  };
};
