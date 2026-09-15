import { CompleteThemeSettingsInternal } from '../../../../../types';

export const getCustomPaginationStyles = (themeSettings: CompleteThemeSettingsInternal) => {
  return {
    // MUI wraps the item list by default, which would push the control onto a second row and out
    // of the fixed-height footer. It is compacted to fit instead — see `getPaginationFooterLayout`.
    '& .MuiPagination-ul': {
      flexWrap: 'nowrap',
    },
    '& .MuiPaginationItem-circular.Mui-selected': {
      color: themeSettings.chart.textColor,
    },
    '& .MuiPaginationItem-circular': {
      color: themeSettings.chart.secondaryTextColor,
      fontFamily: themeSettings.typography.fontFamily,
    },
  };
};
