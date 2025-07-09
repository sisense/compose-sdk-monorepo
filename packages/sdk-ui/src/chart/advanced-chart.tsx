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
import { useCallback, useEffect, useState } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useWidgetErrorsAndWarnings } from '@/widgets/common/widget-errors-and-warnings-context';
import { useHasChanged } from '@/common/hooks/use-has-changed.js';
import { TranslatableError } from '@/translation/translatable-error.js';
import ErrorBoundaryBox from '@/error-boundary/error-boundary-box.js';

const SINGLE_ANALYTICS_FUNCTION_ERROR_CODE = 'BE#081586';
const MULTIPLE_ANALYTICS_FUNCTION_ERROR_CODE = 'BE#733473';

/**
 *
 * @param props
 * @returns
 */
export const AdvancedChart = (props: RegularChartProps) => {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const { setErrors, errors } = useWidgetErrorsAndWarnings();

  const couldDataChange = useHasChanged(props, ['dataOptions', 'filters']);

  useEffect(() => {
    if (couldDataChange && errors.length > 0) {
      // retry trend/forecast rendering
      setRefreshCounter(refreshCounter + 1);
      setErrors([]);
    }
  }, [props.dataOptions, props.filters]);

  if (!isDataSource(props.dataSet)) throw new TranslatableError('errors.undefinedDataSource');
  const cartesianDataOptions = cloneDeep(props.dataOptions) as CartesianChartDataOptions;
  const trendMeasures = extractTrendMeasures(cartesianDataOptions);
  cartesianDataOptions.value.push(...trendMeasures);

  // add forecast measure for any measure with forecast option
  const measureWithForecast = extractForecastMeasures(cartesianDataOptions);
  cartesianDataOptions.value.push(...measureWithForecast);

  /**
   * Handles errors that occur during the rendering of advanced charts.
   * This function will try to filter out trend/forecast measures that
   * failed validation and re-render the chart with the remaining valid measures.
   *
   * If the chart still fails to render, another error handling will occur
   *
   * @param error - The error that occurred during rendering.
   * @returns A React element that represents the advanced chart with secondary error boundary.
   */
  const analyticsFunctionsErrorHandler = useCallback(
    ({ error }: FallbackProps) => {
      console.debug('Unexpected error occurred when rendering advanced chart:', error);

      const filteredDataOptions = cloneDeep(cartesianDataOptions);

      const extractedErrors = extractErrorMessages(error.toString());
      filteredDataOptions.value = filteredDataOptions.value.filter((measure) => {
        const name = 'column' in measure ? measure.column.name : measure.name;

        return !(
          'column' in measure &&
          'type' in measure.column &&
          measure.column.type === 'calculatedmeasure' &&
          extractedErrors.some((error) => error.includes(name))
        );
      });

      return (
        <ErrorBoundary
          key={`errorboundary_${refreshCounter}`}
          fallbackRender={fallbackErrorHandler}
          onError={(err) => {
            const errors = extractErrorMessages(err.toString());
            setErrors((errs: string[]) => {
              return [...new Set([...errs, ...errors])];
            });
          }}
        >
          <RegularChart {...props} dataOptions={filteredDataOptions} />
        </ErrorBoundary>
      );
    },
    [props, errors],
  );

  /**
   * Second fallback error handler for the advanced chart.
   * This function is called when the advanced chart fails to render for the second time,
   * It will try to determine if the error is related to trend/forecast measures.
   *
   * If so, it falls back to rendering a regular chart.
   * This is part of the backward compatibility for the old APIs
   * that do not validate all analytics functions,
   * and instead fail the entire query on the first error.
   *
   * Otherwise, it displays an error boundary box with the first error message.
   *
   * @param error - The error that occurred during rendering.
   * @returns A React element that represents the fallback chart or an error boundary box.
   */
  const fallbackErrorHandler = useCallback(
    ({ error }: FallbackProps) => {
      console.debug('Error occurred when rendering fallback chart:', error);
      // if chart still have analytics function errors, render regular chart
      // might be an old api that fails without validating other analytics functions
      return error.toString().includes(SINGLE_ANALYTICS_FUNCTION_ERROR_CODE) ? (
        <RegularChart {...props} />
      ) : (
        // if it's not trend/forecast and chart rendering still fails
        // render error boundary box with the first error message
        <ErrorBoundaryBox error={errors[0]} />
      );
    },
    [props, errors],
  );

  /**
   * Extracts error messages from the error text.
   * Used specifically for BE#733473 error that provides multiple error messages in a single string.
   * Otherwise it just wraps the error text to an array.
   *
   * @param errorText - The error text to extract messages from.
   * @returns An array of error messages.
   */
  const extractErrorMessages = (errorText: string): string[] => {
    if (errorText.includes(MULTIPLE_ANALYTICS_FUNCTION_ERROR_CODE)) {
      const prefixPattern = /Error: BE#733473 More than 1 Function failed, aggregated failures:\s*/;

      if (prefixPattern.test(errorText)) {
        const stripped = errorText.replace(prefixPattern, '');
        return stripped
          .split(';')
          .map((e) => e.trim())
          .filter(Boolean);
      }
    }

    return [errorText.trim()];
  };

  return (
    // this is advanced chart rendering
    <ErrorBoundary
      key={`errorboundary_${refreshCounter}`}
      fallbackRender={analyticsFunctionsErrorHandler}
      onError={(err) => {
        const errors = extractErrorMessages(err.toString());
        setErrors((errs: string[]) => {
          return [...new Set([...errs, ...errors])];
        });
      }}
    >
      <RegularChart {...props} dataOptions={cartesianDataOptions} />
    </ErrorBoundary>
  );
};
