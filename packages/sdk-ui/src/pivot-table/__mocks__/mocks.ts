import * as DM from '../../__demo__/sample-ecommerce';
import { filterFactory, measureFactory } from '@sisense/sdk-data';
import { PivotTableProps } from '../../props';

export const mockPivotTableProps: PivotTableProps = {
  dataSet: DM.DataSource,
  dataOptions: {
    rows: [
      { column: DM.Category.Category, includeSubTotals: true },
      { column: DM.Commerce.AgeRange, includeSubTotals: true },
      DM.Commerce.Condition,
    ],
    columns: [{ column: DM.Commerce.Gender, includeSubTotals: true }],
    values: [
      {
        column: measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
        dataBars: true,
        totalsCalculation: 'sum',
      },
      {
        column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
        totalsCalculation: 'sum',
      },
    ],
    grandTotals: { title: 'Grand Total', rows: true, columns: true },
  },
  filters: [filterFactory.members(DM.Commerce.Gender, ['Female', 'Male'])],
};
