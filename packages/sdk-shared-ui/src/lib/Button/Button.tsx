import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { ThemeProvider } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import React, { type ForwardedRef, forwardRef } from 'react';

import { EmotionCacheProvider } from '../common/emotion-cache-provider';
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
    <EmotionCacheProvider>
      <ThemeProvider theme={appliedButtonTheme}>
        <MuiButton {...rest} ref={ref}>
          {children}
        </MuiButton>
      </ThemeProvider>
    </EmotionCacheProvider>
  );
});

export default Button;
export { Button };
