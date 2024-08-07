import { render } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { measureFactory } from '@sisense/sdk-data';
import { Chart, HighchartsOptions, SisenseContextProviderProps } from '@/index';
import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';
import * as jaqlForecast from '@/__mocks__/data/mock-jaql-forecast.json';
import * as jaqlTrend from '@/__mocks__/data/mock-jaql-trend.json';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { mockToken, mockUrl, server } from '@/__mocks__/msw';
import { setTimeout } from 'timers/promises';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  enableTracking: false,
  defaultDataSource: 'Sample ECommerce',
  appConfig: { queryCacheConfig: { enabled: false } },
};

describe('Advanced Charts', () => {
  beforeEach(() => {
    server.resetHandlers();
  });
  it('should render forecast trend combo chart', async () => {
    server.use(
      http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlForecast)),
    );

    render(
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
            expect(options).toMatchSnapshot();
            return options;
          }}
        />
      </SisenseContextProvider>,
    );

    // need to wait when doing http
    await setTimeout(250);
  });

  it('should render trend chart', async () => {
    server.use(http.post('*/api/datasources/:dataSource/jaql', () => HttpResponse.json(jaqlTrend)));

    render(
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
            expect(options).toMatchSnapshot();
            return options;
          }}
        />
      </SisenseContextProvider>,
    );

    // need to wait when doing http
    await setTimeout(250);
  });
});
