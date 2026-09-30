import { type DataSource, type Measure, MetadataTypes } from '@sisense/sdk-data';
import isPlainObject from 'lodash-es/isPlainObject';

import {
  isChartWidgetProps,
  isPivotTableWidgetProps,
} from '@/domains/widgets/components/widget-by-id/utils.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import { numberFormatConfigToNumericMask } from '@/domains/widgets/helpers/number-format-config-to-numeric-mask.js';
import type {
  DashboardNarrativeMeasureFormat,
  DashboardNarrativeQuery,
} from '@/infra/api/narrative/dashboard-narrative-endpoints.js';
import type { NumberFormatConfig } from '@/types';

import { buildWidgetNarrativeRequests } from './widget-props-to-narrative-params.js';

type MeasureWithFormat = { measure: Measure; numberFormatConfig?: NumberFormatConfig };

/**
 * Collects every measure in widget data options, bare or inside a styled column, in listed order.
 * @param node - Data options, or any value nested in them.
 * @returns Each measure found, with its number format when a styled column sets one.
 */
function collectMeasures(node: unknown): MeasureWithFormat[] {
  if (Array.isArray(node)) return node.flatMap(collectMeasures);
  if (MetadataTypes.isMeasure(node)) return [{ measure: node as Measure }];
  if (!isPlainObject(node)) return [];

  const object = node as { column?: unknown; numberFormatConfig?: NumberFormatConfig };
  if (object.column !== undefined) {
    return MetadataTypes.isMeasure(object.column)
      ? [{ measure: object.column as Measure, numberFormatConfig: object.numberFormatConfig }]
      : [];
  }
  return Object.values(object).flatMap(collectMeasures);
}

/**
 * Maps the measures a query carries to their number formats, as the widget renders them: the
 * measure's own `numberFormatConfig`, or the default format for a measure without one. Keyed by
 * the measure title in the query JAQL; the first measure of a title wins.
 * @param props - Widget the query is built from.
 * @param jaql - Query JAQL whose measure titles are matched.
 * @returns Formats keyed by measure title, or `undefined` when no queried measure is found.
 */
function toMeasureFormats(
  props: WidgetProps,
  jaql: DashboardNarrativeQuery['jaql'],
): Record<string, DashboardNarrativeMeasureFormat> | undefined {
  const queriedTitles = new Set(
    (jaql.metadata ?? [])
      .filter((item) => item.panel !== 'scope')
      .map((item) => item.jaql?.title)
      .filter((title): title is string => typeof title === 'string'),
  );
  const dataOptions = 'dataOptions' in props ? props.dataOptions : undefined;

  const formats: Record<string, DashboardNarrativeMeasureFormat> = {};
  collectMeasures(dataOptions).forEach(({ measure, numberFormatConfig }) => {
    if (queriedTitles.has(measure.name) && !(measure.name in formats)) {
      formats[measure.name] = numberFormatConfigToNumericMask(numberFormatConfig ?? {});
    }
  });
  return Object.keys(formats).length > 0 ? formats : undefined;
}

function toDashboardNarrativeQuery(
  props: WidgetProps,
  defaultDataSource?: DataSource,
): DashboardNarrativeQuery | undefined {
  const { supported, narrativeRequest, narrativeFallbackRequest } = buildWidgetNarrativeRequests(
    props,
    defaultDataSource,
  );
  const request = narrativeFallbackRequest ?? narrativeRequest;
  if (!supported || !request) return undefined;

  const measureFormats = toMeasureFormats(props, request.jaql);

  if (isChartWidgetProps(props)) {
    return {
      jaql: request.jaql,
      title: props.title,
      chartType: props.chartType,
      ...(measureFormats && { measureFormats }),
    };
  }
  if (isPivotTableWidgetProps(props)) {
    return {
      jaql: request.jaql,
      title: props.title,
      chartType: props.widgetType,
      ...(measureFormats && { measureFormats }),
    };
  }
  return undefined;
}

/**
 * Builds the queries of a dashboard narrative request from the widgets on the dashboard.
 *
 * Chart and pivot widgets become one query each, in the order given; every other widget type is
 * left out, as is a chart or pivot whose data source cannot be resolved or whose query cannot be
 * built. Trend and forecast companion measures are stripped: the service derives trends itself, and
 * one query it cannot run fails the whole request. Each query carries the number format of every
 * measure it queries, since the JAQL itself carries none.
 * @param widgets - Widgets in layout order.
 * @param defaultDataSource - Used when a widget's `dataSource` is undefined.
 * @returns Queries for `getDashboardNarrative`, not yet capped.
 * @internal
 */
export function buildDashboardNarrativeQueries(
  widgets: readonly WidgetProps[],
  defaultDataSource?: DataSource,
): DashboardNarrativeQuery[] {
  return widgets.flatMap((props) => {
    const query = toDashboardNarrativeQuery(props, defaultDataSource);
    return query ? [query] : [];
  });
}
