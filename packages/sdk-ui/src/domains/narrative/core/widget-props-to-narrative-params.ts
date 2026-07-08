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
import { getWidgetNarrativeConfigFromWidgetProps } from './get-widget-narrative-from-widget-props.js';
import { toNlgApiVerbosity } from './to-nlg-api-verbosity.js';
import {
  type CompleteWidgetNarrativeConfig,
  getCompleteWidgetNarrativeConfig,
} from './widget-narrative-config.js';

/**
 * Converts ChartWidgetProps to {@link NarrativeQueryParams} by extracting dimensions and measures
 * from the chart data options.
 *
 * @param props - ChartWidgetProps to convert. `config.narrative` supplies {@link WidgetNarrativeConfig}. Defaults are calculated via {@link getCompleteWidgetNarrativeConfig}
 * @param defaultDataSource - Optional default data source to use if props.dataSource is undefined
 * @returns Params ready for {@link prepareNarrativeRequest}
 * @throws If neither `props.dataSource` nor `defaultDataSource` is set
 * @internal
 */
export function convertChartWidgetPropsToNarrativeParams(
  props: ChartWidgetProps,
  defaultDataSource?: DataSource,
): NarrativeQueryParams {
  const { dataSource, dataOptions, chartType, filters } = props;
  const resolvedDataSource = dataSource ?? defaultDataSource;

  if (!resolvedDataSource) {
    throw new Error(
      'dataSource is required. Provide it in ChartWidgetProps or as defaultDataSource parameter.',
    );
  }

  const { verbosity, includeTrendAndForecast } = getCompleteWidgetNarrativeConfig(
    getWidgetNarrativeConfigFromWidgetProps(props),
  );
  const adaptMeasureOptions = { includeTrendAndForecast };
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
    verbosity: toNlgApiVerbosity(verbosity),
  };
}

/**
 * Builds a narrative API request from pivot widget props using the same JAQL as pivot query
 * execution ({@link getPivotJaqlQueryPayload}).
 *
 * @param props - Pivot widget props (`widgetType: 'pivot'`); `config.narrative` supplies
 *   {@link WidgetNarrativeConfig} via {@link getWidgetNarrativeConfigFromWidgetProps}
 * @param defaultDataSource - Used when `props.dataSource` is undefined
 * @returns Request ready for `getNarrative`
 * @throws If data source cannot be resolved, or pivot query description is invalid
 * @internal
 */
export function convertPivotWidgetPropsToNarrativeRequest(
  props: WithCommonWidgetProps<PivotTableWidgetProps, 'pivot'>,
  defaultDataSource?: DataSource,
): NarrativeRequest {
  const resolvedDataSource = props.dataSource ?? defaultDataSource;

  if (!resolvedDataSource) {
    throw new Error(
      'dataSource is required. Provide it in pivot widget props or as defaultDataSource parameter.',
    );
  }

  const { verbosity, includeTrendAndForecast } = getCompleteWidgetNarrativeConfig(
    getWidgetNarrativeConfigFromWidgetProps(props),
  );

  const pivotDataOptions =
    !includeTrendAndForecast && props.dataOptions.values
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
    verbosity: toNlgApiVerbosity(verbosity),
  });
}

/**
 * @deprecated Use {@link convertChartWidgetPropsToNarrativeParams} for {@link NarrativeQueryParams},
 *   or {@link convertWidgetPropsToNarrativeParams} for a ready {@link NarrativeRequest}.
 */
export const convertChartWidgetPropsToUseGetNlgInsightsParams =
  convertChartWidgetPropsToNarrativeParams;

/**
 * Builds a {@link NarrativeRequest} from chart or pivot widget props (including `id` / `widgetType`).
 *
 * @param props - Chart or pivot {@link WidgetProps}
 * @param defaultDataSource - Used when `props.dataSource` is undefined
 * @returns Request ready for {@link getNarrative}
 * @throws If widget type is not chart or pivot, data source cannot be resolved, or conversion fails
 * @internal
 */
export function convertWidgetPropsToNarrativeParams(
  props:
    | WithCommonWidgetProps<ChartWidgetProps, 'chart'>
    | WithCommonWidgetProps<PivotTableWidgetProps, 'pivot'>,
  defaultDataSource?: DataSource,
): NarrativeRequest {
  if (isPivotTableWidgetProps(props)) {
    return convertPivotWidgetPropsToNarrativeRequest(props, defaultDataSource);
  }
  if (isChartWidgetProps(props)) {
    return prepareNarrativeRequest(
      convertChartWidgetPropsToNarrativeParams(props, defaultDataSource),
    );
  }
  throw new Error('Expected chart or pivot widget props');
}

/**
 * Completes widget narrative options from chart/pivot `WidgetProps` for NLG (`config.narrative`).
 *
 * @param props - Widget props (chart, pivot, or other)
 * @returns Complete narrative defaults for non-chart/pivot types
 * @internal
 */
export function getCompleteWidgetNarrativeConfigFromWidgetProps(
  props: WidgetProps,
): CompleteWidgetNarrativeConfig {
  if (isChartWidgetProps(props) || isPivotTableWidgetProps(props)) {
    return getCompleteWidgetNarrativeConfig(getWidgetNarrativeConfigFromWidgetProps(props));
  }
  return getCompleteWidgetNarrativeConfig(undefined);
}

/**
 * Error message for imperative callers (e.g. {@link getNlgInsightsFromWidget}) when chart or pivot widget
 * props omit `dataSource`, no defaultDataSource can be resolved from app context, and no defaultDataSource is provided.
 *
 * @internal
 */
export const MISSING_DATASOURCE_NLG_ERROR =
  'dataSource is required. Provide it on the widget props, defaultDataSource parameter or via SisenseContextProvider.';

export type WidgetNarrativeRequestPair = {
  supported: boolean;
  narrativeRequest: NarrativeRequest | undefined;
  /**
   * Same request with trend/forecast stripped. `undefined` when `includeTrendAndForecast` is
   * already `false` (primary already stripped), when the widget type is unsupported, or when
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

/** Clones chart/pivot props with `config.narrative.includeTrendAndForecast` forced to `false`. */
function withNarrativeIncludeTrendForecastDisabled<P extends WidgetProps>(props: P): P {
  if (!isChartWidgetProps(props) && !isPivotTableWidgetProps(props)) {
    return props;
  }
  const prev = getWidgetNarrativeConfigFromWidgetProps(props);
  return {
    ...props,
    config: {
      ...(props.config ?? {}),
      narrative: {
        ...(prev ?? {}),
        includeTrendAndForecast: false,
      },
    },
  } as P;
}

/**
 * Builds a primary narrative request and, when useful, a fallback request with trend/forecast
 * stripped — both from the same widget props in a single call.
 *
 * @param props - Chart or pivot widget props
 * @param defaultDataSource - Used when `props.dataSource` is undefined.
 * @returns `{ supported, narrativeRequest, narrativeFallbackRequest }`. `supported` is `false`
 *   when the widget type is unsupported, when no data source can be resolved for chart/pivot, or
 *   when the primary conversion fails.
 * @remarks {@link WidgetNarrativeConfig} are derived from `props.config?.narrative`
 *   via {@link getWidgetNarrativeConfigFromWidgetProps} and {@link getCompleteWidgetNarrativeConfig}.
 * @internal
 */
export function buildWidgetNarrativeRequests(
  props: WidgetProps,
  defaultDataSource?: DataSource,
): WidgetNarrativeRequestPair {
  const { includeTrendAndForecast } = getCompleteWidgetNarrativeConfigFromWidgetProps(props);

  if (isPivotTableWidgetProps(props)) {
    if (!(props.dataSource ?? defaultDataSource)) {
      return unsupportedMissingDataSource();
    }

    let narrativeRequest: NarrativeRequest;
    try {
      narrativeRequest = convertWidgetPropsToNarrativeParams(props, defaultDataSource);
    } catch {
      return createUnsupported();
    }

    let narrativeFallbackRequest: NarrativeRequest | undefined;
    if (includeTrendAndForecast) {
      try {
        narrativeFallbackRequest = convertWidgetPropsToNarrativeParams(
          withNarrativeIncludeTrendForecastDisabled(props),
          defaultDataSource,
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
      narrativeRequest = convertWidgetPropsToNarrativeParams(props, defaultDataSource);
    } catch {
      return createUnsupported();
    }

    let narrativeFallbackRequest: NarrativeRequest | undefined;
    if (includeTrendAndForecast) {
      try {
        narrativeFallbackRequest = convertWidgetPropsToNarrativeParams(
          withNarrativeIncludeTrendForecastDisabled(props),
          defaultDataSource,
        );
      } catch {
        // fallback stays undefined
      }
    }

    return { supported: true, narrativeRequest, narrativeFallbackRequest };
  }

  return createUnsupported();
}
