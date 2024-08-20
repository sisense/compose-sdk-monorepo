import { CompleteThemeSettings, PivotTableStyleOptions } from '@/types';
import { getDarkFactor, getSlightlyDifferentColor, toColor } from '@/utils/color';

const PIVOT_DEFAULT_BORDER_COLOR = '#cbced7';
const PIVOT_DEFAULT_HIGHLIGHT_COLOR = '#ffff9c';

export type PivotStylingProps = {
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  fillColor?: string;
  additionalFillColor?: string;
  fillOptions: {
    alternatingRows?: boolean;
    alternatingColumns?: boolean;
    columnsHeaders?: boolean;
    rowMembers?: boolean;
    totals?: boolean;
  };
  rowHeight?: number;
  isAutoHeight: boolean;
  navigationPrimaryColor?: string;
  navigationSecondaryColor?: string;
  selectionColor: string;
};

export function preparePivotStylingProps(
  styleOptions?: PivotTableStyleOptions,
  themeSettings?: CompleteThemeSettings,
): PivotStylingProps {
  let fillColor;
  let additionalFillColor;
  if (themeSettings?.chart?.backgroundColor) {
    const alternatingFactor =
      getDarkFactor(toColor(themeSettings?.chart?.backgroundColor)) < 0.5 ? 0.07 : -0.07;
    fillColor = getSlightlyDifferentColor(themeSettings?.chart?.backgroundColor, alternatingFactor);
    additionalFillColor = getSlightlyDifferentColor(
      themeSettings?.chart?.backgroundColor,
      alternatingFactor * 1.5,
    );
  }

  return {
    fontFamily: themeSettings?.typography?.fontFamily,
    textColor: themeSettings?.chart?.textColor,
    backgroundColor: themeSettings?.chart?.backgroundColor,
    borderColor: PIVOT_DEFAULT_BORDER_COLOR,
    fillColor,
    additionalFillColor,
    fillOptions: {
      alternatingRows: styleOptions?.alternatingRowsColor,
      alternatingColumns: styleOptions?.alternatingColumnsColor,
      columnsHeaders: styleOptions?.headersColor,
      rowMembers: styleOptions?.membersColor,
      totals: styleOptions?.totalsColor,
    },
    rowHeight: styleOptions?.rowHeight,
    isAutoHeight: styleOptions?.isAutoHeight ?? false,
    navigationPrimaryColor: themeSettings?.typography?.primaryTextColor,
    navigationSecondaryColor: themeSettings?.typography?.secondaryTextColor,
    selectionColor: styleOptions?.highlightColor ?? PIVOT_DEFAULT_HIGHLIGHT_COLOR,
  };
}
