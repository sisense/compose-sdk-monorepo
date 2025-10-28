import { HighchartsGradientColorObject, withGradientConversion } from '@/utils/gradient';
import { omitUndefinedAndEmpty } from '@/utils/omit-undefined';

import { SeriesLabels, TextStyle } from '..';

type DataLabelsOptions = {
  enabled: boolean;
  rotation?: number;
  inside?: boolean;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  style?: TextStyle;
  backgroundColor?: string | HighchartsGradientColorObject;
  borderColor?: string | HighchartsGradientColorObject;
  borderRadius?: number;
  borderWidth?: number;
  padding?: number;
  x?: number;
  y?: number;
  animation?: { defer?: number };
};

export const prepareDataLabelsOptions = (seriesLabels?: SeriesLabels): DataLabelsOptions => {
  const {
    rotation,
    alignInside,
    align,
    verticalAlign,
    textStyle,
    backgroundColor,
    borderColor,
    borderRadius,
    borderWidth,
    padding,
    xOffset,
    yOffset,
    delay,
  } = seriesLabels ?? {};

  return omitUndefinedAndEmpty<DataLabelsOptions>({
    enabled: seriesLabels?.enabled ?? false,
    rotation,
    inside: alignInside,
    align,
    verticalAlign,
    style: textStyle,
    backgroundColor: withGradientConversion(backgroundColor),
    borderColor: withGradientConversion(borderColor),
    borderRadius,
    borderWidth,
    padding,
    x: xOffset,
    y: yOffset,
    animation: { defer: delay },
  });
};
