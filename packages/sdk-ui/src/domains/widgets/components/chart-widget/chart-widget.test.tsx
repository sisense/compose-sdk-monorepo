/** @vitest-environment jsdom */
import { type TFunction } from '@sisense/sdk-common';
import { measureFactory } from '@sisense/sdk-data';
import { HttpClient, SsoAuthenticator } from '@sisense/sdk-rest-client';
import { render } from '@testing-library/react';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { executeQueryMock } from '@/domains/query-execution/core/__mocks__/execute-query';
import { type ClientApplication } from '@/infra/app/types';
import { MenuProvider } from '@/infra/contexts/menu-provider/menu-provider';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';
import { SisenseContextPayload } from '@/infra/contexts/sisense-context/sisense-context';
import { translation } from '@/infra/translation/resources/en';

import { mockChartWidgetPropsForTable, mockResolvedQuery } from '../../__mocks__/mocks';
import { ChartWidget } from './chart-widget';

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');

let mockDrilldownSelectionsChange = false;

vi.mock('./use-with-chart-widget-drilldown', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./use-with-chart-widget-drilldown')>();
  const React = await import('react');
  return {
    useWithChartWidgetDrilldown: (params: {
      propsToExtend: unknown;
      onDrilldownSelectionsChange?: (selections: unknown[]) => void;
    }) => {
      React.useEffect(() => {
        if (mockDrilldownSelectionsChange && params.onDrilldownSelectionsChange) {
          params.onDrilldownSelectionsChange([
            {
              points: [{ categoryValue: 'Male' }],
              nextDimension: DM.Commerce.AgeRange,
            },
          ]);
        }
      }, [params, params.onDrilldownSelectionsChange]);

      const realResult = actual.useWithChartWidgetDrilldown(
        params as Parameters<typeof actual.useWithChartWidgetDrilldown>[0],
      );

      if (mockDrilldownSelectionsChange) {
        return {
          propsWithDrilldown: params.propsToExtend,
          isDrilldownEnabled: false,
          breadcrumbs: null,
        };
      }
      return realResult;
    },
  };
});

const translateMock = vi.fn((key: string) => get(translation, key)) as unknown as TFunction;

vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return {
    ...mod,
    useTranslation: () => ({ t: translateMock }),
  };
});

const defaultContextMock = (): SisenseContextPayload => {
  const url = 'http://mock-url/sometenant?someparam=true';
  return {
    app: {
      httpClient: new HttpClient(url, new SsoAuthenticator(url), 'test'),
      settings: {
        locale: 'en',
        dateConfig: {},
        trackingConfig: { enabled: false },
      },
    } as unknown as ClientApplication,
    tracking: { packageName: 'mock-package-name', enabled: false },
    isInitialized: true,
    errorBoundary: { showErrorBox: true },
  };
};

describe('ChartWidget', () => {
  beforeEach(() => {
    useSisenseContextMock.mockReturnValue(defaultContextMock());
  });

  it('should render table widget', async () => {
    executeQueryMock.mockResolvedValue(mockResolvedQuery);
    const { findByTestId, findAllByRole } = render(
      <MenuProvider>
        <ChartWidget {...mockChartWidgetPropsForTable} />
      </MenuProvider>,
    );
    const table = await findByTestId('table-root');
    expect(table).toBeTruthy();
    const columns = await findAllByRole('columnheader');
    expect(columns.length).toBe(mockResolvedQuery.columns.length);
    const rows = await findAllByRole('row');
    expect(rows.length).toBe(mockResolvedQuery.rows.length + 1); // +1 for header row
  });

  it('should render column widget with applied drilldown', async () => {
    // modifies data mock to match dataOptions with aggregated "Revenue" measure
    const dataMock = cloneDeep(mockResolvedQuery);
    dataMock.columns[1].name = '$measure0_sum Revenue';

    executeQueryMock.mockResolvedValue(dataMock);
    const { findByTestId, findByText } = render(
      <MenuProvider>
        <ChartWidget
          {...{
            chartType: 'column',
            dataSource: DM.DataSource,
            title: 'Column Chart with Drilldown',
            dataOptions: {
              category: [DM.Commerce.Gender],
              value: [measureFactory.sum(DM.Commerce.Revenue)],
              breakBy: [],
            },
            drilldownOptions: {
              drilldownPaths: [],
              drilldownSelections: [
                {
                  points: [
                    {
                      categoryValue: 'Male',
                    },
                  ],
                  nextDimension: DM.Commerce.AgeRange,
                },
              ],
            },
          }}
        />
      </MenuProvider>,
    );

    // verifies rendered chart
    expect(await findByTestId('chart-root')).toBeInTheDocument();

    // verifies existence of drilldown breadcrumbs
    expect(await findByText('Male')).toBeInTheDocument();
    expect(await findByText('Age Range (All)')).toBeInTheDocument();
  });
});

describe('ChartWidget onChange', () => {
  beforeEach(() => {
    mockDrilldownSelectionsChange = true;
    executeQueryMock.mockResolvedValue(mockResolvedQuery);
    useSisenseContextMock.mockReturnValue(defaultContextMock());
  });

  afterEach(() => {
    mockDrilldownSelectionsChange = false;
  });

  it('should call onChange with drilldownSelections/changed event when drilldown selections change', async () => {
    const onChange = vi.fn();
    render(
      <MenuProvider>
        <ChartWidget
          chartType="column"
          dataSource={DM.DataSource}
          dataOptions={{
            category: [DM.Commerce.Gender],
            value: [measureFactory.sum(DM.Commerce.Revenue)],
            breakBy: [],
          }}
          drilldownOptions={{
            drilldownPaths: [DM.Commerce.AgeRange],
            drilldownSelections: [],
          }}
          onChange={onChange}
        />
      </MenuProvider>,
    );

    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        type: 'drilldownSelections/changed',
        payload: [
          {
            points: [{ categoryValue: 'Male' }],
            nextDimension: DM.Commerce.AgeRange,
          },
        ],
      });
    });
  });
});
