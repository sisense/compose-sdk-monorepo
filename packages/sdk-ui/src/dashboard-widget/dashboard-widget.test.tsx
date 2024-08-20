import { mockUrl, mockToken, mockDashboardId, mockWidgetId, server } from '../__mocks__/msw';
import * as widgetDrilldown from '../__mocks__/data/mock-widget-drilldown.json';
import * as jaqlDrilldown from '../__mocks__/data/mock-jaql-drilldown.json';

import { render, waitFor } from '@testing-library/react';
import { DashboardWidget } from './dashboard-widget';
import { SisenseContextProvider } from '../sisense-context/sisense-context-provider';
import { http, HttpResponse } from 'msw';

describe('DashboardWidget', () => {
  beforeEach(() => {
    server.use(
      http.get('*/api/v1/dashboards/:dashboardId/widgets/:widgetId', () =>
        HttpResponse.json(widgetDrilldown),
      ),
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDrilldown)),
    );
  });

  it('should render dashboard widget', async () => {
    expect.assertions(1);

    const { getByText } = render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <DashboardWidget widgetOid={mockWidgetId} dashboardOid={mockDashboardId} />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(getByText('COLUMN CHART WITH DRILLDOWN')).toBeInTheDocument();
    });
  });
});
