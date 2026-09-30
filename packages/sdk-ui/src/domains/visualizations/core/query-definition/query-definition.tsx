import { type FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExecuteQueryParams } from '@/domains/query-execution/types';
import { getTranslatedDataOptions } from '@/domains/visualizations/components/chart/helpers/use-translated-data-options.js';
import { getTableAttributesAndMeasures } from '@/domains/visualizations/components/table/hooks/use-table-data';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import type { ChartProps } from '@/props';

import { translateTableDataOptions } from '../chart-data-options/translate-data-options';
import { appendCustomPills, customPillsToViewModel } from './custom-pills';
import { DEFAULT_MAX_VISIBLE_PILLS, splitCollapsedView } from './query-definition-collapse';
import { QUERY_DEFINITION_TEXT_STYLE } from './query-definition-style-constants';
import { baseQueryParamsToViewModel } from './query-params-to-view-model';
import { QueryPill } from './query-pill';
import type { QueryDefinitionCustomPill } from './types';

export { DEFAULT_MAX_VISIBLE_PILLS };

const EXPANDER_BUTTON_COLOR_STYLE = { color: 'inherit' as const };

const CONNECTOR_CLASS = 'csdk-select-none';

/**
 * Props for the QueryDefinition component.
 *
 * @sisenseInternal
 */
export interface QueryDefinitionProps {
  /** Either chart props (uses getTranslatedDataOptions internally) or query params (same shape as {@link useExecuteQuery}) */
  query: ExecuteQueryParams | ChartProps;
  /**
   * Extra pills appended after chips derived from {@link QueryDefinitionProps.query}.
   * Presentation (`label`, `color`, `pin`) lives on each item — not a parallel override map.
   */
  customPills?: readonly QueryDefinitionCustomPill[];
  /** When true (default), pills show JSON tooltip on hover. */
  showTooltip?: boolean;
  /**
   * Optional DOM box to clamp tooltips (e.g. chart card). Omit for viewport-only — the component
   * root is only one row tall and must not be used as boundary (breaks vertical placement).
   */
  tooltipBoundaryElement?: HTMLElement | null;
  /**
   * Maximum number of characters shown in each pill label before truncation (default `25`).
   * Pass `0` to show the full label.
   */
  maxPillLength?: number;
  /**
   * Maximum number of pills shown before “Show N more”.
   * Defaults to {@link DEFAULT_MAX_VISIBLE_PILLS} when omitted.
   */
  maxVisiblePills?: number;
}

function isChartPropsInput(input: ExecuteQueryParams | ChartProps): input is ChartProps {
  return 'chartType' in input && 'dataOptions' in input && typeof input.chartType === 'string';
}

function chartPropsToQueryParams({
  dataOptions,
  chartType,
  filters,
}: ChartProps): ExecuteQueryParams {
  if (chartType === 'table' && 'columns' in dataOptions) {
    const { attributes: dimensions, measures } = getTableAttributesAndMeasures(
      translateTableDataOptions(dataOptions),
    );
    return { dimensions, measures, filters };
  }
  const { attributes: dimensions, measures } = getTranslatedDataOptions(dataOptions, chartType);
  return { dimensions, measures, filters };
}

/**
 * Read-only query definition as colored pills above the widget.
 * Order: Measures → Dimensions → Filters → customPills; collapsed to {@link QueryDefinitionProps.maxVisiblePills} with “Show N more” / “Show less”.
 *
 * @sisenseInternal
 */
export const QueryDefinition: FunctionComponent<QueryDefinitionProps> = ({
  query: queryInput,
  customPills,
  showTooltip = true,
  tooltipBoundaryElement,
  maxPillLength = 25,
  maxVisiblePills = DEFAULT_MAX_VISIBLE_PILLS,
}) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const [expanded, setExpanded] = useState(false);

  const viewModel = useMemo(() => {
    const params = isChartPropsInput(queryInput) ? chartPropsToQueryParams(queryInput) : queryInput;
    return appendCustomPills(
      baseQueryParamsToViewModel(params, t),
      customPillsToViewModel(customPills, t),
    );
  }, [queryInput, customPills, t]);

  const { visible, moreCount } = useMemo(
    () => splitCollapsedView(viewModel, maxVisiblePills),
    [viewModel, maxVisiblePills],
  );
  const showExpander = moreCount > 0;
  const displayItems = expanded || !showExpander ? viewModel : visible;

  if (viewModel.length === 0) {
    return null;
  }

  return (
    <div
      className="csdk-flex csdk-flex-wrap csdk-items-center csdk-gap-1 csdk-max-w-[800px]"
      style={{
        ...QUERY_DEFINITION_TEXT_STYLE,
        color: themeSettings.chart.textColor,
        overflow: 'visible',
      }}
    >
      {displayItems.map((item, index) =>
        item.type === 'connector' ? (
          <span key={`connector-${index}-${item.label}`} className={CONNECTOR_CLASS}>
            {item.label === 'by'
              ? t('queryDefinition.connectorBy')
              : item.label === 'where'
              ? t('queryDefinition.connectorWhere')
              : item.label}
          </span>
        ) : (
          <QueryPill
            key={item.id ?? `pill-${index}`}
            item={item}
            showTooltip={showTooltip}
            tooltipBoundaryElement={tooltipBoundaryElement}
            maxLength={maxPillLength}
          />
        ),
      )}
      {showExpander && !expanded && (
        <button
          type="button"
          className="csdk-inline-flex csdk-h-6 csdk-shrink-0 csdk-cursor-pointer csdk-items-center csdk-rounded csdk-border-0 csdk-bg-transparent csdk-px-2 csdk-py-1 csdk-underline-offset-2 hover:csdk-underline"
          style={EXPANDER_BUTTON_COLOR_STYLE}
          onClick={() => setExpanded(true)}
        >
          {t('queryDefinition.showMorePills', { count: moreCount })}
        </button>
      )}
      {showExpander && expanded && (
        <button
          type="button"
          className="csdk-inline-flex csdk-h-6 csdk-shrink-0 csdk-cursor-pointer csdk-items-center csdk-rounded csdk-border-0 csdk-bg-transparent csdk-px-2 csdk-py-1 csdk-underline-offset-2 hover:csdk-underline"
          style={EXPANDER_BUTTON_COLOR_STYLE}
          onClick={() => setExpanded(false)}
        >
          {t('queryDefinition.showLess')}
        </button>
      )}
    </div>
  );
};
