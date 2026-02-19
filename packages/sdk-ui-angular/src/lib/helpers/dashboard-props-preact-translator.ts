import { DashboardProps as DashboardPropsPreact } from '@sisense/sdk-ui-preact';

import type { DashboardProps } from '../components/dashboard';
import { toPreactWidgetProps, toWidgetProps } from './widget-props-preact-translator';

export function toPreactDashboardProps(angularProps: DashboardProps): DashboardPropsPreact {
  return {
    ...angularProps,
    widgets: angularProps.widgets.map(toPreactWidgetProps),
  };
}

export function toDashboardProps(preactProps: DashboardPropsPreact): DashboardProps {
  return {
    ...preactProps,
    widgets: preactProps.widgets.map(toWidgetProps),
  };
}
