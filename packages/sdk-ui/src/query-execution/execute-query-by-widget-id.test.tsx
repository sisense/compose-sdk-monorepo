/** @vitest-environment jsdom */

// explicit import as workaround for 'Vitest' plugin in VSCode
// https://github.com/IanVS/vitest-fetch-mock/issues/4
import '../__test-helpers__/setup-vitest';

import { render, waitFor } from '@testing-library/react';
import {
  mockUrl,
  mockToken,
  mockDashboardId,
  mockWidgetId,
  fetchMocks,
} from '../__mocks__/fetch-mocks';
import { ExecuteQueryByWidgetId } from './execute-query-by-widget-id';
import { SisenseContextProvider } from '../sisense-context/sisense-context-provider';
import { QueryResultData } from '@sisense/sdk-data';
import { ExecuteQueryParams } from './types';

describe('ExecuteQueryByWidgetId', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponses(
      fetchMocks.globals, // get global settings
      fetchMocks.palettes, // get color palettes
      fetchMocks.widgetDrilldown, // get widget metadata
      fetchMocks.jaqlDrilldown, // get jaql results
    );
  });

  it('should generate and execute query for the existing widget', async () => {
    const { getByText } = render(
      <SisenseContextProvider url={mockUrl} token={mockToken} enableTracking={false}>
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
    const onDataChangedMock = vi.fn<[QueryResultData, ExecuteQueryParams]>();

    const { getByText } = render(
      <SisenseContextProvider url={mockUrl} token={mockToken} enableTracking={false}>
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
    const onBeforeQueryMock = vi.fn<[ExecuteQueryParams]>();

    const TEXT_TO_DISPLAY = 'Query result ready';

    const { getByText } = render(
      <SisenseContextProvider url={mockUrl} token={mockToken} enableTracking={false}>
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

    expect(onBeforeQueryMock).toHaveBeenCalledOnce();
  });
});
