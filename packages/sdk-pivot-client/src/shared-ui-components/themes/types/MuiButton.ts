export type MuiButton =
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
