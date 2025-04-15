import React from 'react';

import { siColors } from '../themes';
import { Breadcrumbs } from './Breadcrumbs';

export default {
  title: 'Navigation/Breadcrumbs',
};

const breadcrumbItems = [
  {
    label: 'One',
    isActive: false,
  },
  {
    label: 'Two',
    isActive: false,
  },
  {
    label: 'Three',
    isActive: false,
  },
];
export const Default = () => <Breadcrumbs breadcrumbItems={breadcrumbItems} />;

export const WithCustomSeparator = () => (
  <Breadcrumbs breadcrumbItems={breadcrumbItems} separator="›" />
);

export const WithActiveBreadcrumb = () => (
  <Breadcrumbs
    breadcrumbItems={[
      ...breadcrumbItems,
      {
        label: 'Active',
        isActive: true,
      },
    ]}
  />
);

export const WithClickHandler = () => (
  <Breadcrumbs
    breadcrumbItems={[
      ...breadcrumbItems,
      {
        label: 'Prev Clickable',
        onClick: (event: React.MouseEvent<HTMLSpanElement>) =>
          console.log(event.currentTarget.textContent),
      },
      {
        label: 'Active',
        isActive: true,
      },
    ]}
  />
);

export const Collapsable = () => <Breadcrumbs breadcrumbItems={breadcrumbItems} maxItems={2} />;

export const WithCustomTheme = () => (
  <Breadcrumbs
    breadcrumbItems={breadcrumbItems}
    theme={{
      styleOverrides: {
        ol: {
          backgroundColor: siColors.StBackgroundColors.priority,
        },
        li: {
          backgroundColor: siColors.StBackgroundColors.themeAgnostic,
        },
      },
    }}
  />
);
