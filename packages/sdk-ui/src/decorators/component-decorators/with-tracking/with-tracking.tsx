import { useTrackComponentInit, TrackingContextProvider } from './use-track-component-init';
import { ComponentDecorator } from '../as-sisense-component';
import isBoolean from 'lodash/isBoolean';
import isFunction from 'lodash/isFunction';
import { ErrorTracker } from './error-tracker';

type TrackingDecoratorConfig = {
  componentName: string;
  config: {
    skip?: boolean | ((props: any) => boolean);
    transparent?: boolean;
  };
};

/**
 * Adds tracking to the component
 */
export const withTracking: ComponentDecorator<TrackingDecoratorConfig> = ({
  componentName,
  config,
}) => {
  const { skip, transparent } = config || {};
  return (Component) => {
    return (props) => {
      if ((isBoolean(skip) && skip) || (isFunction(skip) && skip(props))) {
        return <Component {...props} />;
      }
      useTrackComponentInit(componentName, props);
      return (
        // If component is transperent for tracking, nested components will be tracked
        <TrackingContextProvider skipNested={!transparent}>
          <ErrorTracker componentName={componentName}>
            <Component {...props} />
          </ErrorTracker>
        </TrackingContextProvider>
      );
    };
  };
};
