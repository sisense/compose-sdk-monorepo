// import { CalcStyles, DesignSettings } from '@sbi/styleguide';
import { siColors } from '../../themes';

export type MuiCheckbox =
  | {
      '.MuiCheckbox-root': {
        color: string;
        '&:hover': {
          color: string;
          borderRadius: string;
          backgroundColor: string;
        };
      };
    }
  | Record<string, never>;

export const calcStyles: any /* CalcStyles */ = (
  designSettings: any /* DesignSettings */,
): MuiCheckbox => ({
  '.MuiCheckbox-root': {
    color: designSettings.general.primaryButtonTextColor,
    '&:hover': {
      color: designSettings.typography.primaryTextColor,
      borderRadius: '50%',
      backgroundColor: siColors.StBackgroundColors.themeAgnostic,
    },
  },
});
