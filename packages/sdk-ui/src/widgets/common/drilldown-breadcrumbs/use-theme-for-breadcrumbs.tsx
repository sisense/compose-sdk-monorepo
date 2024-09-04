import { useThemeContext } from '../../../theme-provider';
import { darken } from '@mui/system/colorManipulator';

export const useThemeForBreadcrumbs = () => {
  const {
    themeSettings: {
      typography: { primaryTextColor, secondaryTextColor, fontFamily },
      general: { backgroundColor, brandColor, primaryButtonTextColor },
      chart: { backgroundColor: chartBackgroundColor },
    },
  } = useThemeContext();
  const activeDrillBackgroundColor: string = darken(chartBackgroundColor, 0.02);
  const activeDrillHoverBackgroundColor = darken(activeDrillBackgroundColor, 0.05);
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
