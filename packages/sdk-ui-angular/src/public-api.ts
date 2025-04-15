/**
 * Public API Surface of @sisense/sdk-ui-angular
 */
export * from './lib/components';
export * from './lib/sdk-ui.module';
export * from './lib/sdk-ui-core-exports';
export * from './lib/services';
export type {
  AreamapDataPointEvent,
  AreamapDataPointEventHandler,
  BoxplotDataPointEvent,
  BoxplotDataPointEventHandler,
  ChartDataPointEvent,
  ChartDataPointsEvent,
  DashboardByIdConfig,
  DashboardConfig,
  DashboardFiltersPanelConfig,
  DataPointEvent,
  DataPointEventHandler,
  DataPointsEvent,
  DataPointsEventHandler,
  ScatterDataPointEvent,
  ScatterDataPointEventHandler,
  ScatterDataPointsEvent,
  ScatterDataPointsEventHandler,
  ScattermapDataPointEvent,
  ScattermapDataPointEventHandler,
} from './lib/types';
export * from './lib/utilities';

/* Re-exports internal core functionalities to use in dependant angular modules */
export {
  createPluginsContextConnector,
  createSisenseContextConnector,
  createThemeContextConnector,
} from './lib/component-wrapper-helpers';
export { TrackableService } from './lib/decorators';
