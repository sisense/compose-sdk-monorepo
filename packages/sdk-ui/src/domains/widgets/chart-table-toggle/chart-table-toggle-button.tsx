import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { getSlightlyDifferentColor } from '@/shared/utils/color/color-interpolation';

const BUTTON_SIZE_PX = 24;

/**
 * Accessible labels for the chart↔table header control.
 *
 * @sisenseInternal
 */
export type ChartTableToggleLabels = {
  showAsTable: string;
  showAsChart: string;
  /** Native `title` when the control is disabled because trend/forecast is on. */
  unavailableWithTrendForecast?: string;
};

/** @internal */
export const DEFAULT_CHART_TABLE_TOGGLE_LABELS: ChartTableToggleLabels = {
  showAsTable: 'Show as table',
  showAsChart: 'Show as chart',
  unavailableWithTrendForecast: 'Table view is not available when trend or forecast is enabled',
};

type ChartTableToggleButtonProps = {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  disabled?: boolean;
  /** Native `title` while disabled. MUI Tooltip is skipped so this is not a full tooltip. */
  disabledTitle?: string;
  labels?: ChartTableToggleLabels;
};

const TABLE_ICON_PATH =
  'M17 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V13V12V7C19 5.89543 18.1046 5 17 5ZM18 12V10H15V12H18ZM14 12V10H10V12H14ZM10 13H14V15H10V13ZM9 12V10H6V12H9ZM6 13V15H9V13H6ZM15 13H18V15H15V13ZM6 17V16H9V18H7C6.44772 18 6 17.5523 6 17ZM14 18H10V16H14V18ZM17 18H15V16H18V17C18 17.5523 17.5523 18 17 18ZM18 7V9H6V7C6 6.44772 6.44772 6 7 6H17C17.5523 6 18 6.44772 18 7Z';
const CHART_ICON_PATH =
  'M5 19V5h1.5v12.5H19V19H5zm3.25-3.25v-4.5h2.25v4.5H8.25zm4.25-7.5v7.5h2.25v-7.5h-2.25zm4.25 3v4.5H19v-4.5h-2.25z';

function ToggleGlyph({ d, color }: { d: string; color: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path fillRule="evenodd" clipRule="evenodd" d={d} fill={color} fillOpacity={0.8} />
    </svg>
  );
}

/** Header icon that switches a chart between its original type and Table. @internal */
export function ChartTableToggleButton({
  pressed,
  onPressedChange,
  disabled = false,
  disabledTitle,
  labels = DEFAULT_CHART_TABLE_TOGGLE_LABELS,
}: ChartTableToggleButtonProps) {
  const { themeSettings } = useThemeContext();
  const iconColor = themeSettings.widget.header.titleTextColor;
  const label = pressed ? labels.showAsChart : labels.showAsTable;
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
      <ToggleGlyph d={pressed ? CHART_ICON_PATH : TABLE_ICON_PATH} color={iconColor} />
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
