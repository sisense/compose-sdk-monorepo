import { colorChineseSilver, colorWhite } from '../../chart-data-options/coloring/consts';
import { AxisSettings } from './axis-section';
import { HighchartsType } from './translations-to-highcharts';

type Navigator = {
  series: { type: HighchartsType; dataGrouping: { enabled: boolean } };
  enabled: boolean;
  margin: number;
  height: number;
  xAxis: AxisSettings;
  handles: {
    symbols: string[];
    backgroundColor: string;
    borderColor: string;
  };
  maskInside: boolean;
  maskFill: string;
  outlineColor: string;
  outlineWidth: number;
  threshold?: number;
  tooltipFormatter?: (min: number, max: number) => { left: string; right: string };
};

// temp until we formally implement colors
export const getNavigator = (
  type: HighchartsType,
  enabled: boolean,
  xAxisCount: number,
  dimension: number, //chart width or height depending on isVertical
  isVertical = false,
): Navigator | { enabled: boolean } => {
  const verticalMinDimensionToDisplayNavigator = 200;
  const horizontalMinDimensionToDisplayNavigator = 400;
  const minDimensionToDisplayNavigator = isVertical
    ? verticalMinDimensionToDisplayNavigator
    : horizontalMinDimensionToDisplayNavigator;
  const isBelowThreshold = dimension < minDimensionToDisplayNavigator;
  const pxPerXAxis = 20;
  const threshold = xAxisCount * pxPerXAxis;
  const isAboveThreshold = dimension > threshold;
  if (!enabled || isBelowThreshold || isAboveThreshold) {
    return { enabled: false };
  }

  // this is a placeholder until we implement xAxis dates
  // and upgrade to sisense-charts version 2.1.3
  const tooltipFormatter = () => ({
    left: '',
    right: '',
  });
  return {
    series: {
      type: type,
      dataGrouping: {
        enabled: false,
      },
    },
    tooltipFormatter,
    enabled: true,
    margin: 30,
    height: 40,
    xAxis: {
      labels: {
        enabled: false,
      },
    },
    handles: {
      symbols: ['navigator-handle', 'navigator-handle'],
      backgroundColor: colorChineseSilver,
      borderColor: colorWhite,
    },
    maskInside: true,
    maskFill: 'rgba(91,99,114, 0.15)',
    outlineColor: colorChineseSilver,
    outlineWidth: 1,
  };
};

export function setInitialScrollerPosition(
  chart: Highcharts.Chart,
  scrollerStart: number,
  scrollerEnd: number,
) {
  const xAxis = chart.xAxis[0];
  // Directly set the extremes using the provided absolute values
  xAxis.setExtremes(scrollerStart, scrollerEnd, false);
}
