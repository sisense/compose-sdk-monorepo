import isBoolean from 'lodash-es/isBoolean';
import isFunction from 'lodash-es/isFunction';

import { useTracking } from '@/shared/hooks/use-tracking';

import { ComponentDecorator } from '../as-sisense-component';
import { ErrorTracker } from './error-tracker';
import {
  TrackingContextProvider,
  useTrackComponentInit,
  useTrackingContext,
} from './use-track-component-init';

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
 * @sisenseInternal
 */
export const withTracking: ComponentDecorator<TrackingDecoratorConfig> = ({
  componentName,
  config,
}) => {
  const { skip, transparent } = config || {};
  return (Component) => {
    return function Tracking(props) {
      const { trackError } = useTracking();
      const { skipNested: parentSkipNested } = useTrackingContext();

      if ((isBoolean(skip) && skip) || (isFunction(skip) && skip(props))) {
        return <Component {...props} />;
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useTrackComponentInit({ componentName, config }, props);
      // A `transparent` component is invisible to tracking nesting: it must not change whether its
      // descendants are tracked. Propagate the inherited parent context so components nested under an
      // already-tracked ancestor (e.g. widgets under a Dashboard that renders an internal
      // ThemeProvider) stay suppressed, while a normal component suppresses its nested components
      // because it is itself the tracked unit.
      const skipNested = transparent ? parentSkipNested : true;
      return (
        <TrackingContextProvider skipNested={skipNested}>
          <ErrorTracker componentName={componentName} handler={trackError}>
            <Component {...props} />
          </ErrorTracker>
        </TrackingContextProvider>
      );
    };
  };
};
