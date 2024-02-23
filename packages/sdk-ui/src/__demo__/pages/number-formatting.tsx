import { Filter, filterFactory, measureFactory } from '@sisense/sdk-data';
import { ChartWidget } from '../../widgets/chart-widget';
import * as DM from '../sample-ecommerce';
import { CartesianChartDataOptions, NumberFormatConfig } from '../../types';
import { TableWidget } from '../../widgets/table-widget';
import { getIndicatorStyleOptions } from './ecommerce-demo';

const format1: NumberFormatConfig = { name: 'Currency', decimalScale: 2 };
const format2: NumberFormatConfig = {
  name: 'Currency',
  decimalScale: 2,
  symbol: '@',
};
const format3: NumberFormatConfig = {
  name: 'Currency',
  kilo: false,
  decimalScale: 2,
  symbol: '#',
};
const format4: NumberFormatConfig = {
  name: 'Currency',
  decimalScale: 2,
  symbol: '!',
};
const format5: NumberFormatConfig = {
  name: 'Currency',
  decimalScale: 2,
  symbol: '^',
};

const dataOptions: CartesianChartDataOptions = {
  category: [
    { column: DM.Category.CategoryID, numberFormatConfig: format1 },
    { column: DM.Commerce.CountryID, numberFormatConfig: format2 },
  ],
  value: [
    {
      column: measureFactory.sum(DM.Commerce.Revenue, 'Revenue'),
      numberFormatConfig: format3,
    },
  ],
  breakBy: [{ column: DM.Commerce.BrandID, numberFormatConfig: format4 }],
};

const filters: Filter[] = [
  filterFactory.members(DM.Commerce.BrandID, ['1', '2']),
  filterFactory.members(DM.Commerce.CountryID, ['1', '2']),
];

export const NumberFormatting = () => (
  <div className="h-fit">
    Number Formatting
    <ChartWidget
      title={'CARTESIAN'}
      dataSource={DM.DataSource}
      chartType="column"
      filters={filters}
      dataOptions={dataOptions}
    />
    <ChartWidget
      title={'PIE'}
      dataSource={DM.DataSource}
      chartType="pie"
      filters={filters}
      dataOptions={{ ...dataOptions, category: [dataOptions.category[0]] }}
    />
    <ChartWidget
      title={'INDICATOR'}
      dataSource={DM.DataSource}
      chartType="indicator"
      filters={filters}
      dataOptions={{
        value: [
          {
            column: DM.Measures.SumRevenue,
            numberFormatConfig: format1,
          },
        ],
        secondary: [
          {
            column: DM.Measures.SumCost,
            numberFormatConfig: format1,
          },
        ],
        min: [{ column: measureFactory.constant(0), numberFormatConfig: format1 }],
        max: [{ column: measureFactory.constant(125000000), numberFormatConfig: format1 }],
      }}
      styleOptions={getIndicatorStyleOptions('My Revenue', 'My Cost')}
    />
    <ChartWidget
      title={'SCATTER'}
      chartType={'scatter'}
      dataSource={DM.DataSource}
      filters={filters}
      dataOptions={{
        x: { column: DM.Measures.SumRevenue, numberFormatConfig: format1 },
        y: { column: DM.Measures.Quantity, numberFormatConfig: format2 },
        breakByPoint: { column: DM.Category.CategoryID, numberFormatConfig: format3 },
        breakByColor: { column: DM.Commerce.BrandID, numberFormatConfig: format4 },
        size: { column: DM.Measures.SumCost, numberFormatConfig: format5 },
      }}
    />
    <TableWidget
      title={'TABLE'}
      dataSource={DM.DataSource}
      filters={filters}
      dataOptions={{ ...dataOptions, columns: [...dataOptions.category, DM.Commerce.Revenue] }}
    />
  </div>
);
