import { QueryResultData } from '@sisense/sdk-data';

import * as DM from '../../__test-helpers__/sample-ecommerce';
import { mockPivotTableProps } from '../../pivot-table/__mocks__/mocks';
import { ChartWidgetProps, PivotTableWidgetProps } from '../../props';

export const mockPivotTableWidgetProps: PivotTableWidgetProps = {
  ...mockPivotTableProps,
  dataSource: DM.DataSource,
  title: 'Pivot table widget title',
  description: 'Pivot table widget desription',
  styleOptions: {
    width: 800,
    membersColor: true,
    headersColor: true,
    border: true,
    borderColor: 'lightgrey',
  },
} as PivotTableWidgetProps;

export const mockChartWidgetPropsForTable: ChartWidgetProps = {
  chartType: 'table',
  dataSource: DM.DataSource,
  title: 'Chart widget title',
  description: 'Chart widget desription',
  dataOptions: {
    columns: [DM.Commerce.AgeRange, DM.Commerce.Revenue],
  },
};

export const mockResolvedQuery: QueryResultData = {
  columns: [
    {
      name: 'Age Range',
      type: 'text',
    },
    {
      name: 'Revenue',
      type: 'number',
    },
  ],
  rows: [
    [
      {
        data: '19-24',
        text: '19-24',
        blur: false,
      },
      {
        data: 43.98411178588867,
        text: '43.9841117858887',
        blur: false,
      },
    ],
    [
      {
        data: '65+',
        text: '65+',
        blur: false,
      },
      {
        data: 62.803104400634766,
        text: '62.8031044006348',
        blur: false,
      },
    ],
  ],
};
