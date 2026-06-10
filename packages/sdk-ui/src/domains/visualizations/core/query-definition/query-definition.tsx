import { type FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExecuteQueryParams } from '@/domains/query-execution/types';
import { getTableAttributesAndMeasures } from '@/domains/visualizations/components/table/hooks/use-table-data';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import type { ChartProps } from '@/props';

import { getTranslatedDataOptions } from '../chart-data-options/get-translated-data-options';
import { translateTableDataOptions } from '../chart-data-options/translate-data-options';
import { QUERY_DEFINITION_TEXT_STYLE } from './query-definition-style-constants';
import { baseQueryParamsToViewModel } from './query-params-to-view-model';
import { QueryPill } from './query-pill';

const MAX_VISIBLE_PILLS = 4;

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
}

function isChartPropsInput(input: ExecuteQueryParams | ChartProps): input is ChartProps {
  return 'chartType' in input && 'dataOptions' in input && typeof input.chartType === 'string';
}

/**
 * Splits view model into visible part (first MAX_VISIBLE_PILLS pills + connectors)
 * and count of remaining pills.
 */
function splitCollapsedView(viewModel: ReturnType<typeof baseQueryParamsToViewModel>): {
  visible: ReturnType<typeof baseQueryParamsToViewModel>;
  moreCount: number;
} {
  let pillCount = 0;
  const visible: ReturnType<typeof baseQueryParamsToViewModel> = [];
  let moreCount = 0;

  for (const item of viewModel) {
    if (item.type === 'pill') {
      if (pillCount < MAX_VISIBLE_PILLS) {
        visible.push(item);
        pillCount += 1;
      } else {
        moreCount += 1;
      }
    } else if (pillCount < MAX_VISIBLE_PILLS && pillCount > 0) {
      visible.push(item);
    }
  }

  return { visible, moreCount };
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
 * Order: Measures → Dimensions → Filters; collapsed to 4 pills with “Show N more” / “Show less”.
 *
 * @sisenseInternal
 */
export const QueryDefinition: FunctionComponent<QueryDefinitionProps> = ({
  query: queryInput,
  showTooltip = true,
  tooltipBoundaryElement,
  maxPillLength = 25,
}) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const [expanded, setExpanded] = useState(false);

  const viewModel = useMemo(() => {
    const params = isChartPropsInput(queryInput) ? chartPropsToQueryParams(queryInput) : queryInput;
    return baseQueryParamsToViewModel(params, t);
  }, [queryInput, t]);

  const { visible, moreCount } = useMemo(() => splitCollapsedView(viewModel), [viewModel]);
  const showExpander = moreCount > 0;
  const displayItems = expanded || !showExpander ? viewModel : visible;

  if (viewModel.length === 0) {
    return null;
  }

  return (
    <div
      className={`csdk-flex csdk-flex-wrap csdk-items-center csdk-gap-1 csdk-max-w-[800px] ${
        expanded || !showExpander ? '' : 'csdk-max-h-[3.5rem] csdk-overflow-hidden'
      }`}
      style={{ ...QUERY_DEFINITION_TEXT_STYLE, color: themeSettings.chart.textColor }}
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
