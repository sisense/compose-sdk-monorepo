import { type WidgetModel as WidgetModelPreact } from '@sisense/sdk-ui-preact';

import { type WidgetConfig } from './widget-config';

/**
 * {@inheritDoc @sisense/sdk-ui!WidgetModel}
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
export interface WidgetModel extends Omit<WidgetModelPreact, 'config'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!WidgetModel.config}
   */
  config?: WidgetConfig;
}
