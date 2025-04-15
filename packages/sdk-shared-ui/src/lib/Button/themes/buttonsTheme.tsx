import { createTheme } from '@mui/material/styles';
import { Components } from '@mui/material/styles/components';

import { sfColors, siColors } from '../../themes';

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    gray: true;
    primary: true;
    secondary: true;
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
              backgroundColor: siColors.StBackgroundColors.workspace,
            },
          },
        },
        {
          props: { variant: 'primary' },
          style: {
            '&:disabled': {
              backgroundColor: siColors.StPrimaryColors.primary,
            },
          },
        },
        {
          props: { variant: 'secondary' },
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
  },
});
export type ButtonsTheme = Components['MuiButton'];

buttonsTheme.shadows[1] = '0px 0px 5px rgba(58, 67, 86, 0.2)';
buttonsTheme.shadows[2] = '0 1px 3px 1px rgba(58, 67, 86, 0.3)';
