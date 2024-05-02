import createTheme from '@mui/material/styles/createTheme';
import { siColors } from '../../themes';

export const tooltipTheme = createTheme({
  components: {
    MuiTooltip: {
      styleOverrides: {
        arrow: {
          color: siColors.StBackgroundColors.workspace,
        },
        tooltip: {
          color: siColors.StTextColors.content,
          maxWidth: '432px',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '12px 16px',
          gap: '10px',
          backgroundColor: siColors.StBackgroundColors.workspace,
          filter:
            'drop-shadow(0px 1px 4px rgba(9, 9, 10, 0.1)) drop-shadow(0px 4px 12px rgba(9, 9, 10, 0.2));',
        },
      },
    },
  },
});

export type TooltipTheme = typeof tooltipTheme;
