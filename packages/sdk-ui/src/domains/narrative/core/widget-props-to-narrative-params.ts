import {
  DataSource,
  DEFAULT_PIVOT_GRAND_TOTALS,
  getFilterListAndRelationsJaql,
} from '@sisense/sdk-data';
import {
  getPivotJaqlQueryPayload,
  type PivotQueryDescription,
  validatePivotQueryDescription,
} from '@sisense/sdk-query-client';
import omit from 'lodash-es/omit';

import { getPivotQueryOptions } from '@/domains/visualizations/components/pivot-table/hooks/use-get-pivot-table-query.js';
import { translatePivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/translate-data-options.js';
import { TableDataOptions } from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  isMeasureColumn,
  safeCombine,
} from '@/domains/visualizations/core/chart-data-options/utils.js';
import { isTable } from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import { ChartWidgetProps } from '@/domains/widgets/components/chart-widget/types';
import type { PivotTableWidgetProps } from '@/domains/widgets/components/pivot-table-widget/types';
import {
  isChartWidgetProps,
  isPivotTableWidgetProps,
} from '@/domains/widgets/components/widget-by-id/utils.js';
import type { WidgetProps, WithCommonWidgetProps } from '@/domains/widgets/components/widget/types';
import type { NarrativeRequest } from '@/infra/api/narrative/narrative-api-types.js';

import type { NarrativeQueryParams } from './build-narrative-request.js';
import { prepareNarrativeRequest } from './build-narrative-request.js';
import {
  getNarrativeDimensionsAndMeasures,
  getNarrativeDimensionsAndMeasuresFromTable,
} from './get-narrative-dimensions-and-measures.js';

/**
 * Converts ChartWidgetProps to {@link NarrativeQueryParams} by extracting dimensions and measures
 * from the chart data options.
 *
 * @param props - ChartWidgetProps to convert
 * @param defaultDataSource - Optional default data source to use if props.dataSource is undefined
 * @param verbosity - Optional verbosity for narrative text
 * @param ignoreTrendAndForecast - When `true`, omits trend/forecast companion measures from the narrative JAQL
 * @returns Params ready for {@link prepareNarrativeRequest}
 * @throws If neither `props.dataSource` nor `defaultDataSource` is set
 * @internal
 */
export function convertChartWidgetPropsToNarrativeParams(
  props: ChartWidgetProps,
  defaultDataSource?: DataSource,
  verbosity?: 'Low' | 'High',
  ignoreTrendAndForecast = false,
): NarrativeQueryParams {
  const { dataSource, dataOptions, chartType, filters } = props;
  const resolvedDataSource = dataSource ?? defaultDataSource;

  if (!resolvedDataSource) {
    throw new Error(
      'dataSource is required. Provide it in ChartWidgetProps or as defaultDataSource parameter.',
    );
  }

  const adaptMeasureOptions = { ignoreTrendAndForecast };
  const { dimensions, measures } = isTable(chartType)
    ? getNarrativeDimensionsAndMeasuresFromTable(
        dataOptions as TableDataOptions,
        adaptMeasureOptions,
      )
    : getNarrativeDimensionsAndMeasures(dataOptions, chartType, adaptMeasureOptions);

  return {
    dataSource: resolvedDataSource,
    dimensions,
    measures,
    filters,
    verbosity,
  };
}

/**
 * Builds a narrative API request from pivot widget props using the same JAQL as pivot query
 * execution ({@link getPivotJaqlQueryPayload}).
 *
 * @param props - Pivot widget props (`widgetType: 'pivot'`)
 * @param defaultDataSource - Used when `props.dataSource` is undefined
 * @param verbosity - Optional verbosity for narrative text
 * @param ignoreTrendAndForecast - When `true`, omits trend/forecast from pivot value columns in the narrative JAQL
 * @returns Request ready for `getNarrative`
 * @throws If data source cannot be resolved, or pivot query description is invalid
 * @internal
 */
export function convertPivotWidgetPropsToNarrativeRequest(
  props: WithCommonWidgetProps<PivotTableWidgetProps, 'pivot'>,
  defaultDataSource?: DataSource,
  verbosity?: 'Low' | 'High',
  ignoreTrendAndForecast = false,
): NarrativeRequest {
  const resolvedDataSource = props.dataSource ?? defaultDataSource;

  if (!resolvedDataSource) {
    throw new Error(
      'dataSource is required. Provide it in pivot widget props or as defaultDataSource parameter.',
    );
  }

  const pivotDataOptions =
    ignoreTrendAndForecast && props.dataOptions.values
      ? {
          ...props.dataOptions,
          values: props.dataOptions.values.map((v) =>
            isMeasureColumn(v) && ('trend' in v || 'forecast' in v)
              ? omit(v, ['trend', 'forecast'])
              : v,
          ),
        }
      : props.dataOptions;

  const dataOptionsInternal = translatePivotTableDataOptions(pivotDataOptions);
  const { rows, columns, values, grandTotals } = getPivotQueryOptions(dataOptionsInternal);
  const { filters: rawFilters = [], relations: filterRelations } = getFilterListAndRelationsJaql(
    props.filters ?? [],
  );

  const filterList = rawFilters.map((entry) => safeCombine(entry, { isScope: true }));
  const highlights = (props.highlights ?? []).map((entry) => safeCombine(entry, { isScope: true }));

  const pivotQueryDescription: PivotQueryDescription = {
    dataSource: resolvedDataSource,
    rowsAttributes: rows ?? [],
    columnsAttributes: columns ?? [],
    measures: values ?? [],
    grandTotals: { ...DEFAULT_PIVOT_GRAND_TOTALS, ...(grandTotals ?? {}) },
    filters: filterList,
    filterRelations,
    highlights,
  };

  validatePivotQueryDescription(pivotQueryDescription);

  const jaqlPayload = getPivotJaqlQueryPayload(pivotQueryDescription, false);
  return prepareNarrativeRequest({
    jaql: jaqlPayload,
    verbosity,
  });
}

/**
 * @deprecated Use {@link convertChartWidgetPropsToNarrativeParams}. Same function; kept for legacy `getNlgInsightsFromWidget`.
 */
export const convertChartWidgetPropsToUseGetNlgInsightsParams =
  convertChartWidgetPropsToNarrativeParams;

/**
 * Error message for imperative callers (e.g. {@link getNlgInsightsFromWidget}) when chart or pivot
 * props omit `dataSource` and no `defaultDataSource` is passed.
 *
 * @internal
 */
export const MISSING_DATASOURCE_NLG_ERROR =
  'dataSource is required. Provide it on the widget props or as defaultDataSource parameter.';

export type WidgetNarrativeRequestPair = {
  supported: boolean;
  narrativeRequest: NarrativeRequest | undefined;
  /**
   * Same request with trend/forecast stripped. `undefined` when `ignoreTrendAndForecast` is
   * already `true` (primary already stripped), when the widget type is unsupported, or when
   * the fallback conversion itself fails.
   */
  narrativeFallbackRequest: NarrativeRequest | undefined;
  /**
   * When `supported` is `false`, `true` means chart/pivot had no resolved data source (props and
   * `defaultDataSource` were both unset); conversion was skipped.
   */
  missingDataSource?: boolean;
};

/** Returns a new unsupported pair so callers cannot mutate shared module state. */
function createUnsupported(): WidgetNarrativeRequestPair {
  return {
    supported: false,
    narrativeRequest: undefined,
    narrativeFallbackRequest: undefined,
  };
}

function unsupportedMissingDataSource(): WidgetNarrativeRequestPair {
  return { ...createUnsupported(), missingDataSource: true };
}

/**
 * Builds a primary narrative request and, when useful, a fallback request with trend/forecast
 * stripped — both from the same widget props in a single call.
 *
 * @param props - Chart or pivot widget props
 * @param defaultDataSource - Used when `props.dataSource` is undefined
 * @param verbosity - Optional verbosity for narrative text
 * @param ignoreTrendAndForecast - When `true`, the primary request already omits trend/forecast
 *   and no fallback is needed
 * @returns `{ supported, narrativeRequest, narrativeFallbackRequest }`. `supported` is `false`
 *   when the widget type is unsupported, when no data source can be resolved for chart/pivot, or
 *   when the primary conversion fails.
 * @example Chart or pivot widget props
 * ```ts
 * const { supported, narrativeRequest, narrativeFallbackRequest } =
 *   buildWidgetNarrativeRequests(
 *     widgetProps, // `WithCommonWidgetProps<ChartWidgetProps, 'chart'>` or pivot equivalent
 *     defaultDataSource,
 *     'High',
 *     false,
 *   );
 * ```
 * On success, `supported` is `true` and `narrativeRequest` / `narrativeFallbackRequest` hold the
 * primary and trend-stripped NLG payloads; otherwise `supported` is `false` and requests are
 * `undefined` (and `missingDataSource` may be set when no source could be resolved).
 * @internal
 */
export function buildWidgetNarrativeRequests(
  props: WidgetProps,
  defaultDataSource?: DataSource,
  verbosity?: 'Low' | 'High',
  ignoreTrendAndForecast = false,
): WidgetNarrativeRequestPair {
  if (isPivotTableWidgetProps(props)) {
    if (!(props.dataSource ?? defaultDataSource)) {
      return unsupportedMissingDataSource();
    }

    let narrativeRequest: NarrativeRequest;
    try {
      narrativeRequest = convertPivotWidgetPropsToNarrativeRequest(
        props,
        defaultDataSource,
        verbosity,
        ignoreTrendAndForecast,
      );
    } catch {
      return createUnsupported();
    }

    let narrativeFallbackRequest: NarrativeRequest | undefined;
    if (!ignoreTrendAndForecast) {
      try {
        narrativeFallbackRequest = convertPivotWidgetPropsToNarrativeRequest(
          props,
          defaultDataSource,
          verbosity,
          true,
        );
      } catch {
        // fallback stays undefined
      }
    }

    return { supported: true, narrativeRequest, narrativeFallbackRequest };
  }

  if (isChartWidgetProps(props)) {
    if (!(props.dataSource ?? defaultDataSource)) {
      return unsupportedMissingDataSource();
    }

    let narrativeRequest: NarrativeRequest;
    try {
      narrativeRequest = prepareNarrativeRequest(
        convertChartWidgetPropsToNarrativeParams(
          props,
          defaultDataSource,
          verbosity,
          ignoreTrendAndForecast,
        ),
      );
    } catch {
      return createUnsupported();
    }

    let narrativeFallbackRequest: NarrativeRequest | undefined;
    if (!ignoreTrendAndForecast) {
      try {
        narrativeFallbackRequest = prepareNarrativeRequest(
          convertChartWidgetPropsToNarrativeParams(props, defaultDataSource, verbosity, true),
        );
      } catch {
        // fallback stays undefined
      }
    }

    return { supported: true, narrativeRequest, narrativeFallbackRequest };
  }

  return createUnsupported();
}
