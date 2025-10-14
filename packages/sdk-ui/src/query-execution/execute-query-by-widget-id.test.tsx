/** @vitest-environment jsdom */
import { render, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { mockDashboardId, mockToken, mockUrl, mockWidgetId, server } from '@/__mocks__/msw';

import * as jaqlDrilldown from '../__mocks__/data/mock-jaql-drilldown.json';
import * as widgetDrilldown from '../__mocks__/data/mock-widget-drilldown.json';
import { SisenseContextProvider } from '../sisense-context/sisense-context-provider';
import { ExecuteQueryByWidgetId } from './execute-query-by-widget-id';

describe('ExecuteQueryByWidgetId', () => {
  beforeEach(() => {
    server.use(
      http.get('*/api/v1/dashboards/:dashboardId/widgets/:widgetId', () =>
        HttpResponse.json(widgetDrilldown),
      ),
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlDrilldown)),
    );
  });

  it('should generate and execute query for the existing widget', async () => {
    const { getByText } = render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <ExecuteQueryByWidgetId widgetOid={mockWidgetId} dashboardOid={mockDashboardId}>
          {({ data, query }) => {
            if (!data || !query) {
              return null;
            }
            return (
              <>
                <div>{`Query sent with ${query.dimensions?.length} dimensions and ${query.measures?.length} measure`}</div>
                <div>{`Result total rows: ${data.rows.length}`}</div>
              </>
            );
          }}
        </ExecuteQueryByWidgetId>
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(getByText('Query sent with 2 dimensions and 1 measure')).toBeInTheDocument();
      expect(getByText('Result total rows: 12')).toBeInTheDocument();
    });
  });

  it('should execute "onDataChanged" callback when query results are ready', async () => {
    const onDataChangedMock = vi.fn();

    const { getByText } = render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <ExecuteQueryByWidgetId
          widgetOid={mockWidgetId}
          dashboardOid={mockDashboardId}
          onDataChanged={onDataChangedMock}
        >
          {() => <div>Query result ready</div>}
        </ExecuteQueryByWidgetId>
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(getByText('Query result ready')).toBeInTheDocument();

      const [data, query] = onDataChangedMock.mock.calls[0];

      expect(onDataChangedMock).toHaveBeenCalledOnce();
      expect(data.rows.length).toBe(12);
      expect(query.dimensions?.length).toBe(2);
      expect(query.measures?.length).toBe(1);
    });
  });

  it('should execute "onBeforeQuery" callback before query execution', async () => {
    const onBeforeQueryMock = vi.fn();

    const TEXT_TO_DISPLAY = 'Query result ready';

    const { getByText } = render(
      <SisenseContextProvider
        url={mockUrl}
        token={mockToken}
        appConfig={{ trackingConfig: { enabled: false } }}
      >
        <ExecuteQueryByWidgetId
          widgetOid={mockWidgetId}
          dashboardOid={mockDashboardId}
          onBeforeQuery={onBeforeQueryMock}
        >
          {() => <div>{TEXT_TO_DISPLAY}</div>}
        </ExecuteQueryByWidgetId>
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(getByText(TEXT_TO_DISPLAY)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(onBeforeQueryMock).toHaveBeenCalledOnce();
    });
  });
});
