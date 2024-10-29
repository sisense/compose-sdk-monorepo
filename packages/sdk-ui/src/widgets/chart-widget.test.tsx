/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { measureFactory } from '@sisense/sdk-data';
import { type TFunction } from '@sisense/sdk-common';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import { mockChartWidgetPropsForTable, mockResolvedQuery } from './__mocks__/mocks';
import { useSisenseContextMock } from '../sisense-context/__mocks__/sisense-context';
import { ClientApplication } from '../app/client-application';
import { HttpClient, SsoAuthenticator } from '@sisense/sdk-rest-client';
import { ChartWidget } from './chart-widget';
import { executeQueryMock } from '@/query/__mocks__/execute-query';
import * as DM from '../__test-helpers__/sample-ecommerce';
import { MenuProvider } from '@/common/components/menu/menu-provider';
import { translation } from '@/translation/resources/en';

vi.mock('../query/execute-query');
vi.mock('../sisense-context/sisense-context');

const translateMock = vi.fn((key: string) => get(translation, key)) as unknown as TFunction;

vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return {
    ...mod,
    useTranslation: () => ({ t: translateMock }),
  };
});

describe('ChartWidget', () => {
  beforeEach(() => {
    const url = 'mock-url';
    useSisenseContextMock.mockReturnValue({
      app: {
        httpClient: new HttpClient(url, new SsoAuthenticator(url), 'test'),
        settings: {
          locale: 'en',
          dateConfig: {},
          trackingConfig: { enabled: false },
        },
      } as unknown as ClientApplication,
      tracking: { packageName: 'mock-package-name' },

      isInitialized: true,
    });
  });

  it('should render table widget', async () => {
    executeQueryMock.mockResolvedValue(mockResolvedQuery);
    const { container, findByLabelText } = render(
      <MenuProvider>
        <ChartWidget {...mockChartWidgetPropsForTable} />
      </MenuProvider>,
    );
    const table = await findByLabelText('table-root');
    expect(table).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('should render column widget with applied drilldown', async () => {
    // modifies data mock to match dataOptions with aggregated "Revenue" measure
    const dataMock = cloneDeep(mockResolvedQuery);
    dataMock.columns[1].name = '$measure0_sum Revenue';

    executeQueryMock.mockResolvedValue(dataMock);
    const { findByLabelText, findByText } = render(
      <MenuProvider>
        <ChartWidget
          {...{
            chartType: 'column',
            dataSource: DM.DataSource,
            title: 'Column Chart with Drilldown',
            dataOptions: {
              category: [DM.Commerce.Gender],
              value: [measureFactory.sum(DM.Commerce.Revenue)],
            },
            drilldownOptions: {
              drilldownDimensions: [],
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
    expect(await findByLabelText('chart-root')).toBeInTheDocument();

    // verifies existence of drilldown breadcrumbs
    expect(await findByText('Male')).toBeInTheDocument();
    expect(await findByText('Age Range (All)')).toBeInTheDocument();
  });
});
