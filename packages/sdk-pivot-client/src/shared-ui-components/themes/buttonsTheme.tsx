import createTheme from '@mui/material/styles/createTheme';
// import { injectStylesWithWrapper } from '@sbi/styleguide';

import { siColors, sfColors } from './colors';
import type { SisenseTheme } from './types';
// import { calcStyles } from './uiCustomization';

// injectStylesWithWrapper && injectStylesWithWrapper(calcStyles);

declare module '@mui/material' {
  interface Theme {
    sisense: SisenseTheme;
  }

  // allow configuration using `createTheme`
  interface ThemeOptions {
    sisense?: Partial<SisenseTheme>;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    gray: true;
  }
}
export const buttonsTheme = createTheme({
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'gray' },
          style: {
            backgroundColor: siColors.StUiColors.guiding,
            color: siColors.StInteractionColors.linkHovered,
            '&:hover': {
              backgroundColor: siColors.StInteractionColors.guidingHover,
            },
            '&:disabled': {
              backgroundColor: '#EDEEF2',
            },
          },
        },
        {
          props: { variant: 'contained' },
          style: {
            '&:disabled': {
              backgroundColor: siColors.StPrimaryColors.primary,
            },
          },
        },
        {
          props: { variant: 'outlined' },
          style: {
            backgroundColor: siColors.StBackgroundColors.workspace,
            color: siColors.StInteractionColors.linkHovered,
            border: `1px solid ${sfColors.$SHUTTLE_GRAY_DARK}`,
            '&:hover': {
              backgroundColor: siColors.StBackgroundColors.workspace,
              border: `1px solid ${sfColors.$SHUTTLE_GRAY_DARK}`,
            },
            '&:disabled': {
              backgroundColor: siColors.StBackgroundColors.workspace,
            },
          },
        },
        {
          props: { variant: 'text' },
          style: {
            color: siColors.StTextColors.link,
            '&:hover': {
              backgroundColor: siColors.StInteractionColors.guidingHover,
            },
            '&:disabled': {
              backgroundColor: siColors.StBackgroundColors.workspace,
            },
          },
        },
      ],
      styleOverrides: {
        root: {
          borderRadius: '4px',
          height: '28px',
          lineHeight: '24px',
          minHeight: 0,
          textTransform: 'none',
          color: siColors.StTextColors.active,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: siColors.StInteractionColors.primaryHovered,
            boxShadow: 'none',
          },
          '&:disabled': {
            color: sfColors.$SHUTTLE_GRAY_DARK,
            opacity: '.3',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#1FAFF3',
          '&:hover': {
            color: '#0065e3',
            textDecoration: 'none',
          },
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        color: sfColors.$SHUTTLE_GRAY_DARK,
      },
    },
  },
  typography: {
    fontFamily: 'Open Sans',
    fontSize: 13,
  },
  palette: {
    primary: {
      light: '#757ce8',
      main: siColors.StPrimaryColors.primary,
      dark: siColors.StPrimaryColors.primary,
      contrastText: siColors.StBackgroundColors.workspace,
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
    success: {
      light: '#5BE584',
      main: '#00AB55',
      dark: '#007B55',
    },
  },
});

buttonsTheme.shadows[1] = '0px 0px 5px rgba(58, 67, 86, 0.2)';
buttonsTheme.shadows[2] = '0 1px 3px 1px rgba(58, 67, 86, 0.3)';
