/* eslint-disable react-hooks/exhaustive-deps */
import { CartesianChartDataOptions } from '@/index';
import { RegularChartProps } from '../props.js';
import './chart.css';
import { RegularChart } from './regular-chart.js';
import { isDataSource } from '@sisense/sdk-data';
import cloneDeep from 'lodash-es/cloneDeep';
import {
  extractForecastMeasures,
  extractTrendMeasures,
} from '@/chart-options-processor/advanced-chart-options.js';
import { useCallback } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useWidgetErrorsAndWarnings } from '@/widgets/common/widget-errors-and-warnings-context';

/**
 *
 * @param props
 * @returns
 */
export const AdvancedChart = (props: RegularChartProps) => {
  const { setErrors, errors } = useWidgetErrorsAndWarnings();
  if (!isDataSource(props.dataSet)) throw 'error, advanced charts only works against a data model';
  const cartesianDataOptions = cloneDeep(props.dataOptions) as CartesianChartDataOptions;
  const trendMeasures = extractTrendMeasures(cartesianDataOptions);
  cartesianDataOptions.value.push(...trendMeasures);

  // add forecast measure for any measure with forecast option
  const measureWithForecast = extractForecastMeasures(cartesianDataOptions);
  cartesianDataOptions.value.push(...measureWithForecast);

  const unexpectedErrorHandler = useCallback(
    ({ error }: FallbackProps) => {
      // this is regular chart rendering if advanced chart rendering fails
      console.debug('Unexpected error occurred when rendering advanced chart:', error);
      return <RegularChart {...props} />;
    },
    [props, errors],
  );

  // this supposed to mean that both advanced chart rendering and regular chart rendering failed
  if (errors.length === 2) {
    return null;
  }

  return (
    // this is advanced chart rendering
    <ErrorBoundary
      key={`errorboundary_'${new Date().getTime().toString()}`}
      fallbackRender={unexpectedErrorHandler}
      onError={(err) => {
        setErrors((errs: string[]) => {
          return [...errs, err.message];
        });
      }}
    >
      <RegularChart {...props} dataOptions={cartesianDataOptions} />
    </ErrorBoundary>
  );
};
