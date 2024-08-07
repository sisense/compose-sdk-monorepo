/* eslint-disable react-hooks/exhaustive-deps */
import { CartesianChartDataOptions, StyledMeasureColumn } from '@/index.js';
import { RegularChartProps } from '../props.js';
import './chart.css';
import { RegularChart } from './regular-chart.js';
import { isDataSource, Measure, measureFactory } from '@sisense/sdk-data';
import cloneDeep from 'lodash/cloneDeep';
import { FORECAST_PREFIX, TREND_PREFIX } from '@/chart-options-processor/advanced-chart-options.js';

/**
 *
 * @param props
 * @returns
 */
export const AdvancedChart = (props: RegularChartProps) => {
  if (!isDataSource(props.dataSet)) throw 'error, advanced charts only works against a data model';

  const cartesianDataOptions = cloneDeep(props.dataOptions) as CartesianChartDataOptions;

  // add trend measure for any measure with trend option
  const measureWithTrend = cartesianDataOptions.value
    .filter((v) => (v as StyledMeasureColumn)?.trend !== undefined)
    .map((v) =>
      measureFactory.trend(
        (v as StyledMeasureColumn).column as Measure,
        `${TREND_PREFIX}_${(v as StyledMeasureColumn).column.name}`,
        (v as StyledMeasureColumn).trend,
      ),
    );
  cartesianDataOptions.value.push(...measureWithTrend);

  // add forecast measure for any measure with forecast option
  const measureWithForecast = cartesianDataOptions.value
    .filter((v) => (v as StyledMeasureColumn)?.forecast !== undefined)
    .map((v) =>
      measureFactory.forecast(
        (v as StyledMeasureColumn).column as Measure,
        `${FORECAST_PREFIX}_${(v as StyledMeasureColumn).column.name}`,
        (v as StyledMeasureColumn).forecast,
      ),
    );
  cartesianDataOptions.value.push(...measureWithForecast);

  return <RegularChart {...props} dataOptions={cartesianDataOptions} />;
};
