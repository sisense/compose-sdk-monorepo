import {
  dashboardModelTranslator,
  WidgetsPanelColumnLayout,
} from '@/domains/dashboarding/dashboard-model';
import { widgetModelTranslator } from '@/domains/widgets/widget-model';

import { sampleEcommerceDashboard } from '../__mocks__/sample-ecommerce-dashboard.js';

export const createMinimalDashboardModel = () =>
  dashboardModelTranslator.fromDashboardDto({
    oid: 'dashboard-123',
    title: 'Test Dashboard',
    datasource: {
      title: 'Sample ECommerce',
      id: 'Sample ECommerce',
    },
    widgets: [],
  });

export const createDashboardWithLayout = (layout: WidgetsPanelColumnLayout) => {
  const model = createMinimalDashboardModel();
  return {
    ...model,
    layoutOptions: { ...model.layoutOptions, widgetsPanel: layout },
  };
};

export const createWidgetModel = (oid: string) => ({
  ...widgetModelTranslator.fromWidgetDto(sampleEcommerceDashboard.widgets![0]!),
  oid,
});

export const dashboardOid = 'dashboard-123';
