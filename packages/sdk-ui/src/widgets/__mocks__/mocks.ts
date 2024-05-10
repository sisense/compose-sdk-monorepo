import * as DM from '../../__test-helpers__/sample-ecommerce';
import { PivotTableWidgetProps } from '../../props';
import { mockPivotTableProps } from '../../pivot-table/__mocks__/mocks';

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
