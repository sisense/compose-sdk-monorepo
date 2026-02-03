import { measureFactory } from '@sisense/sdk-data';
import { render, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import * as jaqlForecast from '@/__mocks__/data/mock-jaql-forecast.json';
import * as jaqlTrend from '@/__mocks__/data/mock-jaql-trend.json';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { Chart, HighchartsOptions, SisenseContextProviderProps } from '@/index';
import { SisenseContextProvider } from '@/infra/contexts/sisense-context/sisense-context-provider';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  defaultDataSource: 'Sample ECommerce',
  appConfig: {
    queryCacheConfig: { enabled: false },
    trackingConfig: { enabled: false },
  },
};

describe('Advanced Charts', () => {
  beforeEach(() => {
    server.resetHandlers();
  });
  it('should render forecast trend combo chart', async () => {
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlForecast)),
    );

    let preparedHighchartsOptions: HighchartsOptions | undefined;

    const { findByLabelText } = render(
      <SisenseContextProvider {...contextProviderProps}>
        <Chart
          dataSet={DM.DataSource}
          chartType={'line'}
          dataOptions={{
            category: [DM.Commerce.Date.Months],
            value: [
              {
                column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
                forecast: {
                  forecastHorizon: 6,
                },
              },
              {
                column: measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
                forecast: {
                  forecastHorizon: 6,
                },
                trend: {
                  modelType: 'advancedSmoothing',
                },
              },
            ],
            breakBy: [],
          }}
          styleOptions={{ height: 600 }}
          onBeforeRender={(options: HighchartsOptions) => {
            preparedHighchartsOptions = options;
            return options;
          }}
        />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(preparedHighchartsOptions).toBeDefined();
      expect(preparedHighchartsOptions).toMatchSnapshot();
    });

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });

  it('should render trend chart', async () => {
    server.use(http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlTrend)));

    let preparedHighchartsOptions: HighchartsOptions | undefined;

    const { findByLabelText } = render(
      <SisenseContextProvider {...contextProviderProps}>
        <Chart
          dataSet={DM.DataSource}
          chartType={'line'}
          dataOptions={{
            category: [DM.Commerce.Date.Months],
            value: [
              {
                column: measureFactory.sum(DM.Commerce.Cost, 'Cost'),
                trend: {
                  modelType: 'advancedSmoothing',
                },
              },
            ],
            breakBy: [],
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            preparedHighchartsOptions = options;
            return options;
          }}
        />
      </SisenseContextProvider>,
    );

    await waitFor(() => {
      expect(preparedHighchartsOptions).toBeDefined();
      expect(preparedHighchartsOptions).toMatchSnapshot();
    });

    expect(await findByLabelText('chart-root')).toBeInTheDocument();
  });
});
