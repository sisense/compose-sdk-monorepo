import { type WidgetHeaderConfig as WidgetHeaderConfigPreact } from '@sisense/sdk-ui-preact';

/**
 * Configuration for the widget header.
 */
export interface WidgetHeaderConfig
  extends Omit<WidgetHeaderConfigPreact, 'items' | 'onBeforeRender'> {}
