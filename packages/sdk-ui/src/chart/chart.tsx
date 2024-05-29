import { ChartProps, RegularChartProps, TabularChartProps } from '../props';

import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import './chart.css';

import { RegularChart } from './regular-chart';
import { TableComponent } from '@/table/table-component';
import { TranslatableError } from '@/translation/translatable-error';
import { shouldSkipSisenseContextWaiting } from './helpers/should-skip-sisense-context-waiting';

/**
 * A React component used for easily switching chart types or rendering multiple series of different chart types.
 *
 * ## Example
 *
 * A chart component displaying total revenue per quarter from the Sample ECommerce data model. The component is currently set to show the data in a column chart.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts/chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * @param props - Chart properties
 * @returns Chart component representing a chart type as specified in `ChartProps.`{@link ChartProps.chartType | chartType}
 * @group Charts
 */
export const Chart = asSisenseComponent({
  componentName: 'Chart',
  shouldSkipSisenseContextWaiting,
  customContextErrorMessageKey: 'errors.chartNoSisenseContext',
})((props: ChartProps) => {
  if (isTabularChartProps(props)) {
    return <TableComponent {...props} />;
  }
  if (isRegularChartProps(props)) {
    return <RegularChart {...props} />;
  }
  throw new TranslatableError('errors.chartInvalidProps');
});

function isTabularChartProps(props: ChartProps): props is TabularChartProps {
  return props.chartType === 'table' && 'columns' in props.dataOptions;
}

function isRegularChartProps(props: ChartProps): props is RegularChartProps {
  return props.chartType !== 'table';
}
