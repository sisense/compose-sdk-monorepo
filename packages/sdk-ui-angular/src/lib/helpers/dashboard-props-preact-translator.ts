import { DashboardProps as DashboardPropsPreact } from '@ethings-os/sdk-ui-preact';

import { DashboardProps } from '../components/dashboard';
import {
  translateFromPreactWidgetProps,
  translateToPreactWidgetProps,
} from './widget-props-preact-translator';

export function translateToPreactDashboardProps(
  dashboardProps: DashboardProps,
): DashboardPropsPreact {
  return {
    ...dashboardProps,
    widgets: dashboardProps.widgets.map(translateToPreactWidgetProps),
  };
}

export function translateFromPreactDashboardProps(
  dashboardProps: DashboardPropsPreact,
): DashboardProps {
  return {
    ...dashboardProps,
    widgets: dashboardProps.widgets.map(translateFromPreactWidgetProps),
  };
}
