import type { FunctionComponent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getQueryPillTooltipModel } from './compose-code-to-readable';
import { QUERY_PILL_LABEL_STYLE } from './query-definition-style-constants';
import { QueryPillBubbleTooltip } from './query-pill-bubble-tooltip';
import type { QueryPillCategory, QueryPillItem } from './types';

/**
 * Fixed chip styling — intentionally not tied to theme (product/design spec).
 */
const PILL_COLORS: Record<QueryPillCategory, { bg: string; text: string }> = {
  measure: { bg: '#d0f1e1', text: '#131F29' },
  dimension: { bg: '#ebe9fe', text: '#131F29' },
  filter: { bg: '#d7edf7', text: '#131F29' },
  operator: { bg: '#ebe9fe', text: '#131F29' },
};

function tooltipTitleFromModel(
  model: NonNullable<ReturnType<typeof getQueryPillTooltipModel>>,
  t: (key: string) => string,
): ReactNode {
  return (
    <div
      className="csdk-m-0 csdk-max-h-64 csdk-overflow-auto csdk-whitespace-pre-wrap csdk-break-all"
      style={{ margin: 0 }}
    >
      <div>{`${t('queryDefinition.tooltipType')}: ${model.typeLabel}`}</div>
      {model.showColumnInTooltip ? (
        <div>{`${t('queryDefinition.tooltipColumn')}: ${model.column}`}</div>
      ) : null}
      {model.showFormulaInTooltip ? (
        <div>{`${t('queryDefinition.tooltipFormula')}: ${model.formula}`}</div>
      ) : null}
    </div>
  );
}

/**
 * Props for {@link QueryPill}.
 *
 * @sisenseInternal
 */
export interface QueryPillProps {
  item: QueryPillItem;
  showTooltip?: boolean;
  tooltipBoundaryElement?: HTMLElement | null;
}

/**
 * Read-only query-definition pill; JSON tooltip is a portal bubble with a real triangle.
 *
 * @sisenseInternal
 */
export const QueryPill: FunctionComponent<QueryPillProps> = ({
  item,
  showTooltip = true,
  tooltipBoundaryElement,
}) => {
  const { t } = useTranslation();
  const { bg, text } = PILL_COLORS[item.category];
  const tooltipModel = useMemo(() => getQueryPillTooltipModel(item), [item]);
  const tooltipTitle = tooltipModel === null ? null : tooltipTitleFromModel(tooltipModel, t);
  const preferBelow = tooltipModel ? (tooltipModel.layoutText ?? '').split('\n').length > 3 : false;
  const [tipOpen, setTipOpen] = useState(false);

  const pill = (
    <span
      className="csdk-inline-flex csdk-items-center csdk-rounded csdk-px-2 csdk-py-0.5 csdk-font-normal csdk-whitespace-nowrap csdk-max-w-full csdk-truncate"
      style={{
        backgroundColor: bg,
        color: text,
        ...QUERY_PILL_LABEL_STYLE,
      }}
    >
      {item.label}
    </span>
  );

  if (!showTooltip || tooltipTitle === null) {
    return pill;
  }

  return (
    <QueryPillBubbleTooltip
      open={tipOpen}
      onOpenChange={setTipOpen}
      content={tooltipTitle}
      preferBelow={preferBelow}
      boundaryElement={tooltipBoundaryElement}
    >
      <span className="csdk-cursor-default">{pill}</span>
    </QueryPillBubbleTooltip>
  );
};
