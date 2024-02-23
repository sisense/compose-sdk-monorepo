import { sfColors } from '../colors/siColors';

type SisenseTheme = {
  gray: string;
  brand: string;
  faded: string;
  border: string;
  grayText: string;
  shadow: string;
  shadowHover: string;
  sf: typeof sfColors;
};

type MuiButtonTypes =
  | {
      '.MuiButton-contained': {
        backgroundColor: string;
        color: string;
        '&:hover': {
          backgroundColor: string;
          color: string;
        };
        '&:disabled': {
          backgroundColor: string;
          color: string;
        };
      };
    }
  | Record<string, never>;

type MuiIconTypes =
  | {
      '.MuiIcon-root': {
        color: string;
      };
    }
  | Record<string, null>;

export type { SisenseTheme, MuiButtonTypes, MuiIconTypes };
