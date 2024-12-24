import createTheme from '@mui/material/styles/createTheme';
// import { injectStylesWithWrapper } from '@sbi/styleguide';
//import { calcStyles } from './uiCustomization';

// TODO: review this later
// injectStylesWithWrapper && injectStylesWithWrapper(calcStyles);
import { siColors, type SisenseTheme } from '../../themes';

declare module '@mui/material' {
  interface Theme {
    sisense: SisenseTheme;
  }

  interface ThemeOptions {
    sisense?: Partial<SisenseTheme>;
  }
}

export const checkboxTheme = createTheme({
  components: {
    MuiCheckbox: {
      styleOverrides: {
        root: {
          width: '28px',
          height: '28px',
          '&.Mui-disabled': {
            opacity: 0.5,
          },
          '&:hover': {
            backgroundColor: siColors.StInteractionColors.defaultHover,
          },
          '& .MuiSvgIcon-root': {
            fontSize: 14,
            fill: siColors.StUiColors.default,
          },
        },
      },
    },
  },
});

export type CheckboxTheme = typeof checkboxTheme;
