import { colorChineseSilver, colorWhite } from '../chart-options-service';
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
): Navigator | { enabled: boolean } => {
  const navigatorThreshold = 70;
  if (!enabled || xAxisCount < navigatorThreshold) {
    return { enabled: false };
  }

  // this is a placeholder until we implement xAxis dates
  // and upgrade to sisense-charts version 2.1.3
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
