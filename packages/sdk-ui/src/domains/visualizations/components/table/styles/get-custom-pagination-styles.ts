import { CompleteThemeSettingsInternal } from '../../../../../types';

export const getCustomPaginationStyles = (themeSettings: CompleteThemeSettingsInternal) => {
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
