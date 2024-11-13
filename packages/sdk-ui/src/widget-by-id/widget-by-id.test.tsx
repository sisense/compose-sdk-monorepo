import { mockUrl, mockToken, mockDashboardId, mockWidgetId, server } from '../__mocks__/msw.js';
import * as widgetDrilldown from '../__mocks__/data/mock-widget-drilldown.json';
import * as jaqlDrilldown from '../__mocks__/data/mock-jaql-drilldown.json';

import { render, waitFor } from '@testing-library/react';
import { SisenseContextProvider } from '../sisense-context/sisense-context-provider.js';
import { http, HttpResponse } from 'msw';
import { WidgetById } from './widget-by-id.js';

describe('WidgetById', () => {
  beforeEach(() => {
    server.use(
      http.get('*/api/v1/dashboards/:dashboardId/widgets/:widgetId', () =>
        HttpResponse.json(widgetDrilldown),
      ),
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDrilldown)),
    );
  });

  it('should render widget by id', async () => {
    expect.assertions(1);

    const { getByText } = render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <WidgetById widgetOid={mockWidgetId} dashboardOid={mockDashboardId} />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(getByText('COLUMN CHART WITH DRILLDOWN')).toBeInTheDocument();
    });
  });
});
