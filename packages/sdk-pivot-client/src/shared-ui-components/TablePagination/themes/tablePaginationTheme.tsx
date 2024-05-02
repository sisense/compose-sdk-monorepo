import createTheme from '@mui/material/styles/createTheme';

// import { injectStylesWithWrapper, themeService } from '@sbi/styleguide';

import { siColors, stEffects } from '../../themes';
// import { calcStyles } from './uiCustomization';
import { tablePaginationResponsiveWidth } from './tablePaginationResponsiveDesign';

// injectStylesWithWrapper && injectStylesWithWrapper(calcStyles);
export const tablePaginationTheme = createTheme({
  breakpoints: {
    values: tablePaginationResponsiveWidth,
  },
  components: {
    MuiTablePagination: {
      styleOverrides: {
        root: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        },
        toolbar: {
          '&.MuiTablePagination-toolbar': {
            display: 'flex',
            flexDirection: 'row',
            padding: '0px 20px 0 20px',
            alignItems: 'center',
            height: '30px',
            width: '100%',
          },
          '.Mui-selected': {
            margin: 0,
          },
        },
        spacer: {
          display: 'none',
        },
        displayedRows: {
          whiteSpace: 'nowrap',
        },
        selectLabel: {
          order: 4,
          paddingLeft: '20px',
        },
        input: {
          order: 5,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: '4px',
          marginRight: '0',
        },
        select: {
          '&.MuiTablePagination-select': {
            background: 'transparent',
          },
        },
        selectIcon: { top: '8%' },
        menuItem: {
          paddingLeft: '10px',
          '&.MuiTablePagination-menuItem.Mui-selected': {
            position: 'relative',
            background: 'transparent',
            // '&:hover': {
            //     backgroundColor:
            //         themeService.getDesignSettings().typography.primaryTextColor,
            //     color: themeService.getDesignSettings().typography.primaryTextColor,
            // },
            '&:after': {
              marginLeft: '15px',
              content: '""',
              display: 'block',
              position: 'absolute',
              width: '24px',
              height: '24px',
              top: '3px',
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M16.2604 8.58124L10.9174 16.0615L7 12.1442L7.70711 11.4371L10.7898 14.5197L15.4467 8L16.2604 8.58124Z' fill='%235B6372'/%3E%3C/svg%3E%0A\")",
            },
          },
          '&.MuiTablePagination-menuItem': {
            fontFamily: 'Open Sans',
            fontWeight: '400',
            fontSize: '13px',
            lineHeight: '18px',
            color: siColors.StTextColors.content,
          },
          '&:hover': {
            backgroundColor: siColors.StBackgroundColors.priority,
          },
        },
        actions: {
          marginLeft: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '4px 0px',
          gap: '4px',
          marginTop: '4px',
          background: siColors.StBackgroundColors.workspace,
          boxShadow: stEffects.Shadows.level1,
          borderRadius: '4px',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
          width: '100%',
        },
      },
    },
  },
});

export type TablePaginationTheme = typeof tablePaginationTheme;
