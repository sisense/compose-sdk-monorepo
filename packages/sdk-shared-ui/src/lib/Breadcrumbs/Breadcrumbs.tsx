import MuiBreadcrumbs, { BreadcrumbsProps as MuiBreadcrumbsProps } from '@mui/material/Breadcrumbs';
import { ThemeProvider } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import React, { ForwardedRef } from 'react';

import { Icon } from '../Icon';
import { Typography } from '../Typography';
import { BreadcrumbsTheme, breadcrumbsTheme } from './themes';

export type BreadcrumbItem = {
  label: string;
  isActive?: boolean;
  onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
};

export type BreadcrumbsProps = {
  breadcrumbItems: BreadcrumbItem[];
  theme?: BreadcrumbsTheme;
} & MuiBreadcrumbsProps &
  React.HTMLAttributes<HTMLDivElement>;

const BreadcrumbSeparator = React.memo(() => <Icon name="general-double-arrow-front" />);

const Breadcrumbs = React.forwardRef(
  (
    { theme, breadcrumbItems, separator = <BreadcrumbSeparator />, ...rest }: BreadcrumbsProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const appliedBreadcrumbsTheme = theme
      ? deepmerge(breadcrumbsTheme, { components: { MuiBreadcrumbs: theme } })
      : breadcrumbsTheme;

    return (
      <ThemeProvider theme={appliedBreadcrumbsTheme}>
        <MuiBreadcrumbs aria-label="breadcrumb" ref={ref} {...rest} separator={separator}>
          {breadcrumbItems.map(({ label, isActive, onClick }, index) => (
            <Typography
              key={`${label}-${index}`}
              variant={isActive ? 'laccent' : 'bodyUI'}
              onClick={onClick}
              sx={onClick ? { cursor: 'pointer' } : {}}
            >
              {label}
            </Typography>
          ))}
        </MuiBreadcrumbs>
      </ThemeProvider>
    );
  },
);

export default Breadcrumbs;
export { Breadcrumbs };
