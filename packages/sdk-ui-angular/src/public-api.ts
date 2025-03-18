/**
 * Public API Surface of @sisense/sdk-ui-angular
 */
export * from './lib/sdk-ui.module';
export * from './lib/components';
export * from './lib/services';
export * from './lib/sdk-ui-core-exports';
export type {
  DataPointEvent,
  AreamapDataPointEvent,
  BoxplotDataPointEvent,
  ScatterDataPointEvent,
  ScattermapDataPointEvent,
  ChartDataPointEvent,
  DataPointsEvent,
  ChartDataPointsEvent,
  ScatterDataPointsEvent,
  DataPointEventHandler,
  ScattermapDataPointEventHandler,
  AreamapDataPointEventHandler,
  BoxplotDataPointEventHandler,
  DataPointsEventHandler,
  ScatterDataPointEventHandler,
  ScatterDataPointsEventHandler,
} from './lib/types';

/* Re-exports internal core functionalities to use in dependant angular modules */
export {
  createThemeContextConnector,
  createSisenseContextConnector,
  createPluginsContextConnector,
} from './lib/component-wrapper-helpers';
export { TrackableService } from './lib/decorators';
