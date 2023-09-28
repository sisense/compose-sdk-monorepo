import { useThemeContext } from '../../../components/theme-provider';
import { darken } from '@mui/material';

export const useThemeForBreadcrumbs = () => {
  const {
    themeSettings: {
      typography: { primaryTextColor, secondaryTextColor, fontFamily },
      general: { backgroundColor, brandColor, primaryButtonTextColor },
      chart: { backgroundColor: chartBackgroundColor, panelBackgroundColor },
    },
  } = useThemeContext();
  const activeDrillBackgroundColor: string =
    panelBackgroundColor != chartBackgroundColor
      ? panelBackgroundColor
      : darken(panelBackgroundColor, 0.3);
  const activeDrillHoverBackgroundColor = darken(activeDrillBackgroundColor, 0.1);
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
