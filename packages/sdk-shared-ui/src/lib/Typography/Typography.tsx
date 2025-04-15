import ThemeProvider from '@mui/material/styles/ThemeProvider';
import MuiTypography, {
  type TypographyProps as MuiTypographyProps,
} from '@mui/material/Typography';
import React, { ForwardedRef } from 'react';

import { type TypographyTheme, typographyTheme } from './themes';

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
