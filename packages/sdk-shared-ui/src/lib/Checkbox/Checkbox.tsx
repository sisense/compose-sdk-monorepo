import React, { forwardRef } from 'react';
import MuiCheckbox, { CheckboxProps as MuiCheckboxProps } from '@mui/material/Checkbox';
import ThemeProvider from '@mui/material/styles/ThemeProvider';

import { checkboxTheme, type CheckboxTheme } from './themes';

export type CheckboxProps = {
  dataTestId?: string;
  disabled?: boolean;
  inline?: boolean;
  onDescriptionClick?: () => void;
  text?: string;
  textClassName?: string;
  title?: string;
  transparent?: boolean;
  inputCheckboxClassName?: string;
} & MuiCheckboxProps & { theme?: CheckboxTheme };

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ theme = checkboxTheme, dataTestId, ...rest }, ref) => (
    <ThemeProvider theme={theme}>
      <MuiCheckbox data-testid={dataTestId} ref={ref} {...rest} />
    </ThemeProvider>
  ),
);

export default Checkbox;
export { Checkbox };
