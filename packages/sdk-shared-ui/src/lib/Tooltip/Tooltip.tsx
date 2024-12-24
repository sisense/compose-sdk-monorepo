import React, { forwardRef } from 'react';
import MuiTooltip, { type TooltipProps as MuiTooltipProps } from '@mui/material/Tooltip';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import classnames from 'classnames';

import { tooltipTheme, type TooltipTheme } from './themes';
import { styleguideConstants } from '../constants/styleguideConstants';
import styles from './Tooltip.module.scss';

export type TooltipProps = MuiTooltipProps & { theme?: TooltipTheme };

const Tooltip = forwardRef(
  ({ title, children, arrow, theme = tooltipTheme, ...rest }: TooltipProps, ref) => {
    const { classes: customClasses = {} } = rest;
    const classes = {
      ...customClasses,
      tooltip: classnames(
        styles.tooltip,
        customClasses.tooltip,
        styleguideConstants.SISENSE_NAMESPACE,
      ),
    };
    return (
      <ThemeProvider theme={theme}>
        <MuiTooltip {...rest} title={title} arrow={arrow} ref={ref} classes={classes}>
          {children}
        </MuiTooltip>
      </ThemeProvider>
    );
  },
);

export default Tooltip;
export { Tooltip };
