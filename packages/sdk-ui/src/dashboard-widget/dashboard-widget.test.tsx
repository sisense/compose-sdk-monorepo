import {
  mockUrl,
  mockToken,
  mockDashboardId,
  mockWidgetId,
  fetchMocks,
} from '../__mocks__/fetch-mocks';

import { render, waitFor } from '@testing-library/react';
import { DashboardWidget } from './dashboard-widget';
import { SisenseContextProvider } from '../components/sisense-context/sisense-context-provider';

describe('DashboardWidget', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should render dashboard widget', async () => {
    expect.assertions(1);

    // Rendering a dashboard widget requires 4 fetches
    fetchMock.mockResponses(
      fetchMocks.globals, // get global settings
      fetchMocks.palettes, // get color palettes
      fetchMocks.widgetDrilldown, // get widget metadata
      fetchMocks.jaqlDrilldown, // get jaql results
    );

    const { getByText } = render(
      <SisenseContextProvider url={mockUrl} token={mockToken} enableTracking={false}>
        <DashboardWidget widgetOid={mockWidgetId} dashboardOid={mockDashboardId} />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(getByText('COLUMN CHART WITH DRILLDOWN')).toBeInTheDocument();
    });
  });
});
