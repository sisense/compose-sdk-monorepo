import { type DashboardModel as DashboardModelPreact } from '@sisense/sdk-ui-preact';

import { type WidgetModel } from '../widgets/widget-model';

/**
 * {@inheritDoc @sisense/sdk-ui!DashboardModel}
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
export interface DashboardModel extends Omit<DashboardModelPreact, 'widgets'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardModel.widgets}
   */
  widgets: WidgetModel[];
}
