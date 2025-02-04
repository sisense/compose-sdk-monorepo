import React, { type ForwardedRef, forwardRef } from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

import { type ButtonsTheme, buttonsTheme } from './themes';

export type ButtonProps = {
  theme?: ButtonsTheme;
} & MuiButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef((props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const { children, theme, ...rest } = props;

  const appliedButtonTheme = theme
    ? deepmerge(buttonsTheme, {
        components: {
          MuiButton: theme,
        },
      })
    : buttonsTheme;

  return (
    <ThemeProvider theme={appliedButtonTheme}>
      <MuiButton {...rest} ref={ref}>
        {children}
      </MuiButton>
    </ThemeProvider>
  );
});

export default Button;
export { Button };
