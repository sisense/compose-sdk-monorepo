import ThemeProvider from '@mui/material/styles/ThemeProvider';
import MuiTooltip, { type TooltipProps as MuiTooltipProps } from '@mui/material/Tooltip';
import classnames from 'classnames';
import React, { forwardRef } from 'react';

import { EmotionCacheProvider } from '../common/emotion-cache-provider';
import { styleguideConstants } from '../constants/styleguideConstants';
import { type TooltipTheme, tooltipTheme } from './themes';
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
      <EmotionCacheProvider>
        <ThemeProvider theme={theme}>
          <MuiTooltip {...rest} title={title} arrow={arrow} ref={ref} classes={classes}>
            {children}
          </MuiTooltip>
        </ThemeProvider>
      </EmotionCacheProvider>
    );
  },
);

export default Tooltip;
export { Tooltip };
