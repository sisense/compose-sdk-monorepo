import { HighchartsGradientColorObject, withGradientConversion } from '@/shared/utils/gradient';
import { omitUndefinedAndEmpty } from '@/shared/utils/omit-undefined';
import { TextStyle, TotalLabels } from '@/types';

type StackLabelsOptions = {
  enabled: boolean;
  rotation?: number;
  align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  animation?: { defer: number };
  backgroundColor?: string | HighchartsGradientColorObject;
  borderColor?: string | HighchartsGradientColorObject;
  borderRadius?: number;
  borderWidth?: number;
  style?: TextStyle;
  x?: number;
  y?: number;
};

export const prepareStackLabels = (totalLabels: TotalLabels): StackLabelsOptions => {
  const {
    enabled,
    rotation,
    align,
    verticalAlign,
    delay,
    backgroundColor,
    borderColor,
    borderRadius,
    borderWidth,
    textStyle,
    xOffset,
    yOffset,
  } = totalLabels ?? {};
  const { align: textAlign, ...style } = textStyle ?? {};
  return omitUndefinedAndEmpty<StackLabelsOptions>({
    enabled: enabled ?? false,
    rotation,
    align,
    textAlign,
    verticalAlign,
    animation: delay !== undefined ? { defer: delay } : undefined,
    backgroundColor: withGradientConversion(backgroundColor),
    borderColor: withGradientConversion(borderColor),
    borderRadius,
    borderWidth,
    style,
    x: xOffset,
    y: yOffset,
  });
};
