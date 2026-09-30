import { type FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useThemeContext } from '@/infra/contexts/theme-provider';

import { FILTER_CHIP_SEPARATOR } from './filter-to-readable-label';
import { QUERY_TOOLTIP_LABEL_STYLE } from './query-definition-style-constants';
import type { GroupedTooltipLine } from './types';

/** Visible filter rows in a grouped tooltip before “Show N more”. */
export const MAX_GROUPED_TOOLTIP_LINES = 10;

type GroupedFilterTooltipProps = {
  lines: readonly GroupedTooltipLine[];
  open: boolean;
};

/**
 * Grouped-filter tooltip body: bold column names, collapse after 10 rows.
 *
 * @param lines - Filter rows to list (`column` bold, then value)
 * @param open - Whether the hosting pill tooltip is open; expansion resets when this becomes false
 * @returns Tooltip body, or `null` when `lines` is empty
 * @internal
 */
export const GroupedFilterTooltip: FunctionComponent<GroupedFilterTooltipProps> = ({
  lines,
  open,
}) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const [expanded, setExpanded] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  useEffect(() => {
    if (!open) {
      setExpanded(false);
      setLinkHovered(false);
    }
  }, [open]);

  const expand = useCallback(() => {
    setExpanded(true);
  }, []);

  if (lines.length === 0) {
    return null;
  }

  const showExpander = lines.length > MAX_GROUPED_TOOLTIP_LINES && !expanded;
  const visible = showExpander ? lines.slice(0, MAX_GROUPED_TOOLTIP_LINES) : lines;
  const moreCount = lines.length - MAX_GROUPED_TOOLTIP_LINES;
  const { hyperlinkColor, hyperlinkHoverColor } = themeSettings.typography;

  return (
    <div
      className="csdk-m-0 csdk-max-h-64 csdk-overflow-auto csdk-whitespace-pre-wrap csdk-break-all"
      style={{ margin: 0 }}
    >
      {visible.map((line, index) => (
        <div key={`${index}-${line.column}-${line.value}`}>
          <strong style={QUERY_TOOLTIP_LABEL_STYLE}>{line.column}</strong>
          {line.value ? `${FILTER_CHIP_SEPARATOR}${line.value}` : null}
        </div>
      ))}
      {showExpander && (
        <button
          type="button"
          className="csdk-mt-1 csdk-cursor-pointer csdk-border-0 csdk-bg-transparent csdk-p-0 csdk-underline-offset-2 hover:csdk-underline"
          style={{ color: linkHovered ? hyperlinkHoverColor : hyperlinkColor }}
          onMouseEnter={() => setLinkHovered(true)}
          onMouseLeave={() => setLinkHovered(false)}
          onClick={expand}
        >
          {t('queryDefinition.showMorePills', { count: moreCount })}
        </button>
      )}
    </div>
  );
};
