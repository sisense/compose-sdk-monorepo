import createTheme from '@mui/material/styles/createTheme';

// import { injectStylesWithWrapper, themeService } from '@sbi/styleguide';

import { siColors } from '../../../themes';
// import { calcStyles } from './uiCustomization';

const DEFAULT_HEIGHT = '24px';
const DEFAULT_WIDTH = '24px';

// injectStylesWithWrapper && injectStylesWithWrapper(calcStyles);

export const paginationActionsComponentTheme = createTheme({
  components: {
    MuiPagination: {
      styleOverrides: {
        root: {
          display: 'flex',
          justifyContent: 'space-around',
          flexGrow: 1,
          '.MuiPagination-ul': {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height: DEFAULT_HEIGHT,
          },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          height: DEFAULT_HEIGHT,
          minWidth: DEFAULT_WIDTH,
          margin: '0 2px',
          '&.Mui-selected': {
            border: `1px solid ${siColors.StUiColors.default}`,
            borderRadius: '12px',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: siColors.StBackgroundColors.themeAgnostic,
              // color: themeService.getDesignSettings().typography.primaryTextColor,
            },
          },
          '&:hover': {
            backgroundColor: siColors.StBackgroundColors.themeAgnostic,
            // color: themeService.getDesignSettings().typography.primaryTextColor,
          },
          '&.MuiPaginationItem-ellipsis': {
            background: 'transparent',
            fontFamily: 'Open Sans',
            fontWeight: '400',
            fontSize: '13px',
            lineHeight: '18px',
            paddingTop: '4px',
          },
          '&.MuiPaginationItem-firstLast': {
            display: 'none',
          },
          '&.MuiPaginationItem-previousNext': {
            width: '40px',
          },
        },
      },
    },
  },
});

export type PaginationActionsComponentTheme = typeof paginationActionsComponentTheme;
