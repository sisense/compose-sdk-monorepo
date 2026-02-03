import { asSisenseComponent } from '../../../../infra/decorators/component-decorators/as-sisense-component';
import { BoxplotChartProps } from '../../../../props';
import { Chart } from '../chart';
import { shouldSkipSisenseContextWaiting } from '../chart/helpers/should-skip-sisense-context-waiting';

/**
 * A React component representing data in a way that visually describes the distribution,
 * variability, and center of a data set along an axis.
 *
 * ## Example
 *
 * Boxplot chart displaying data from the Sample ECommerce data model.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts%2Fboxplot-chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * @param props - Boxplot chart properties
 * @returns Boxplot Chart component
 * @group Charts
 */
export const BoxplotChart = asSisenseComponent({
  componentName: 'BoxplotChart',
  shouldSkipSisenseContextWaiting,
})((props: BoxplotChartProps) => {
  return <Chart {...props} chartType="boxplot" />;
});
