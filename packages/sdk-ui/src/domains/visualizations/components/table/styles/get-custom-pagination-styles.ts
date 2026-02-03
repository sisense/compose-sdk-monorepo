import { CompleteThemeSettings } from '../../../../../types';

export const getCustomPaginationStyles = (themeSettings: CompleteThemeSettings) => {
  return {
    '& .MuiPaginationItem-circular.Mui-selected': {
      color: themeSettings.chart.textColor,
    },
    '& .MuiPaginationItem-circular': {
      color: themeSettings.chart.secondaryTextColor,
      fontFamily: themeSettings.typography.fontFamily,
    },
  };
};
