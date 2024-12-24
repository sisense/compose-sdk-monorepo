import React, { ForwardedRef } from 'react';
import MuiTypography, {
  type TypographyProps as MuiTypographyProps,
} from '@mui/material/Typography';
import ThemeProvider from '@mui/material/styles/ThemeProvider';

import { typographyTheme, type TypographyTheme } from './themes';

export type TypographyProps = MuiTypographyProps & {
  theme?: TypographyTheme;
  dataTestId?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

const Typography = React.forwardRef(
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

export default Typography;
export { Typography };
