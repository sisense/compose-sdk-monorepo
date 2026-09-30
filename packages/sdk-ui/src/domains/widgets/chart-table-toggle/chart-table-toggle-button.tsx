import { useTranslation } from 'react-i18next';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { getSlightlyDifferentColor } from '@/shared/utils/color/color-interpolation';

import { SwitchToChartIcon, SwitchToTableIcon } from './chart-table-toggle-icons';

const BUTTON_SIZE_PX = 24;

/**
 * Accessible labels for the chart↔table header control.
 *
 * When omitted, the control uses `widgetHeader.chartTableToggle` translations:
 * "Switch to Table" while showing a chart, and "Switch to Chart" while showing a table.
 *
 * @sisenseInternal
 */
export type ChartTableToggleLabels = {
  showAsTable: string;
  showAsChart: string;
};

/** @internal */
export const DEFAULT_CHART_TABLE_TOGGLE_LABELS: ChartTableToggleLabels = {
  showAsTable: 'Switch to Table',
  showAsChart: 'Switch to Chart',
};

type ChartTableToggleButtonProps = {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  disabled?: boolean;
  /** Native `title` while disabled. MUI Tooltip is skipped so this is not a full tooltip. */
  disabledTitle?: string;
  labels?: ChartTableToggleLabels;
};

/** Header icon that switches a chart between its original type and Table. @internal */
export function ChartTableToggleButton({
  pressed,
  onPressedChange,
  disabled = false,
  disabledTitle,
  labels,
}: ChartTableToggleButtonProps) {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const iconColor = themeSettings.widget.header.titleTextColor;
  const resolvedLabels = {
    showAsTable:
      labels?.showAsTable ??
      t(
        'widgetHeader.chartTableToggle.switchToTable',
        DEFAULT_CHART_TABLE_TOGGLE_LABELS.showAsTable,
      ),
    showAsChart:
      labels?.showAsChart ??
      t(
        'widgetHeader.chartTableToggle.switchToChart',
        DEFAULT_CHART_TABLE_TOGGLE_LABELS.showAsChart,
      ),
  };
  const label = pressed ? resolvedLabels.showAsChart : resolvedLabels.showAsTable;
  const button = (
    <IconButton
      onClick={() => {
        if (!disabled) {
          onPressedChange(!pressed);
        }
      }}
      disabled={disabled}
      aria-label={disabled ? disabledTitle ?? label : label}
      aria-pressed={pressed}
      data-testid="chart-table-toggle"
      sx={{
        p: 0,
        width: BUTTON_SIZE_PX,
        height: BUTTON_SIZE_PX,
        minWidth: BUTTON_SIZE_PX,
        minHeight: BUTTON_SIZE_PX,
        color: iconColor,
        '&:hover': {
          backgroundColor: getSlightlyDifferentColor(iconColor, undefined, 0.1),
        },
      }}
    >
      {pressed ? <SwitchToChartIcon /> : <SwitchToTableIcon />}
    </IconButton>
  );

  if (disabled) {
    return <span title={disabledTitle ?? label}>{button}</span>;
  }

  return (
    <Tooltip
      title={label}
      style={{
        color: themeSettings.chart?.textColor,
        fontFamily: themeSettings.typography?.fontFamily,
      }}
    >
      {button}
    </Tooltip>
  );
}
