import { scaleBrightness } from '@/utils/color';

import { useThemeContext } from '../../../theme-provider';

export const useThemeForBreadcrumbs = () => {
  const {
    themeSettings: {
      typography: { primaryTextColor, secondaryTextColor, fontFamily },
      general: { backgroundColor, brandColor, primaryButtonTextColor },
      chart: { backgroundColor: chartBackgroundColor },
    },
  } = useThemeContext();

  const activeDrillBackgroundColor: string = scaleBrightness(chartBackgroundColor, -0.02);
  const activeDrillHoverBackgroundColor = scaleBrightness(activeDrillBackgroundColor, -0.05);
  return {
    primaryTextColor,
    secondaryTextColor,
    fontFamily,
    backgroundColor,
    brandColor,
    primaryButtonTextColor,
    chartBackgroundColor,
    activeDrillBackgroundColor,
    activeDrillHoverBackgroundColor,
  };
};
