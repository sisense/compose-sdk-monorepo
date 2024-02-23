import React, { ForwardedRef } from 'react';
import {
  Typography as MuiTypography,
  type TypographyProps as MuiTypographyProps,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { typographyTheme, type TypographyTheme } from './themes';

export type TypographyProps = MuiTypographyProps & {
  theme?: TypographyTheme;
  dataTestId?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

export const Typography = React.forwardRef(
  (
    { children, theme = typographyTheme, dataTestId, ...rest }: TypographyProps,
    ref: ForwardedRef<HTMLSpanElement>,
  ) => (
    <ThemeProvider theme={theme}>
      <MuiTypography ref={ref} {...rest} data-testid={dataTestId}>
        {children}
      </MuiTypography>
    </ThemeProvider>
  ),
);
