import isBoolean from 'lodash-es/isBoolean';
import isFunction from 'lodash-es/isFunction';

import { useTracking } from '@/shared/hooks/use-tracking';

import { ComponentDecorator } from '../as-sisense-component';
import { ErrorTracker } from './error-tracker';
import { TrackingContextProvider, useTrackComponentInit } from './use-track-component-init';

/**
 * Configuration for withTracking decorator
 *
 * @internal
 */
export type TrackingDecoratorConfig = {
  componentName: string;
  config: {
    skip?: boolean | ((props: any) => boolean);
    transparent?: boolean;
    packageName?: string;
    packageVersion?: string;
  };
};

/**
 * Adds tracking to the component
 *
 * @internal
 */
export const withTracking: ComponentDecorator<TrackingDecoratorConfig> = ({
  componentName,
  config,
}) => {
  const { skip, transparent } = config || {};
  return (Component) => {
    return function Tracking(props) {
      const { trackError } = useTracking();

      if ((isBoolean(skip) && skip) || (isFunction(skip) && skip(props))) {
        return <Component {...props} />;
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useTrackComponentInit({ componentName, config }, props);
      return (
        // If component is transperent for tracking, nested components will be tracked
        <TrackingContextProvider skipNested={!transparent}>
          <ErrorTracker componentName={componentName} handler={trackError}>
            <Component {...props} />
          </ErrorTracker>
        </TrackingContextProvider>
      );
    };
  };
};
