import { createTheme } from '@mui/material/styles';
// import { injectStylesWithWrapper, themeService, utils } from '@sbi/styleguide';

// import { calcStyles } from './uiCustomization';
import { siColors } from '../../themes';

// injectStylesWithWrapper && injectStylesWithWrapper(calcStyles);

declare module '@mui/material/Icon' {
  interface IconPropsVariantOverrides {
    gray: true;
  }
}

export const iconTheme = createTheme({
  components: {
    MuiIcon: {
      styleOverrides: {
        root: {
          color: `${siColors.StPrimaryColors.primary}`,
          top: 0,
        },
      },
    },
    MuiSvgIcon: {
      // styleOverrides: {
      //     root: {
      //         fill: utils.makeASlightlyDifferentColor(
      //             themeService.getDesignSettings().typography.primaryTextColor,
      //             0.9,
      //         ),
      //     },
      // },
    },
  },
});

export type IconTheme = typeof iconTheme;
