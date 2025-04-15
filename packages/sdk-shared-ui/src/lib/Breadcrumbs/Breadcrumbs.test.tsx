import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { Icon } from '../Icon';
import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs Component', () => {
  const breadcrumbOne = 'One';
  const breadcrumbTwo = 'Two';
  const breadcrumbThree = 'Three';
  const breadcrumbItems = [
    {
      label: breadcrumbOne,
      isActive: false,
    },
    {
      label: breadcrumbTwo,
      isActive: false,
    },
    {
      label: breadcrumbThree,
      isActive: false,
    },
  ];

  it('should render correctly with children', () => {
    render(<Breadcrumbs breadcrumbItems={breadcrumbItems} />);

    expect(screen.getByText(breadcrumbOne)).toBeInTheDocument();
    expect(screen.getByText(breadcrumbTwo)).toBeInTheDocument();
    expect(screen.getByText(breadcrumbThree)).toBeInTheDocument();
  });

  it('should apply custom className correctly', () => {
    render(<Breadcrumbs breadcrumbItems={breadcrumbItems} className="custom-class" />);

    const breadcrumbs = screen.getByRole('navigation');

    expect(breadcrumbs).toHaveClass('custom-class');
  });

  it('should apply custom data-test id correctly', () => {
    render(<Breadcrumbs breadcrumbItems={breadcrumbItems} data-testid="breadcrumbs" />);

    const breadcrumbs = screen.getByTestId('breadcrumbs');

    expect(breadcrumbs).toBeInTheDocument();
  });

  it('should render custom separator correctly', () => {
    render(
      <Breadcrumbs
        breadcrumbItems={breadcrumbItems}
        separator={<Icon name={'general-double-arrow-front'} data-testid="customSeparator" />}
      />,
    );

    const separator = screen.getAllByTestId('customSeparator');

    expect(separator.length).toBe(2);
  });

  it('should limit the number of items based on maxItems prop', () => {
    render(<Breadcrumbs breadcrumbItems={breadcrumbItems} maxItems={2} />);

    expect(screen.getByText(breadcrumbOne)).toBeInTheDocument();
    expect(screen.queryByText(breadcrumbTwo)).not.toBeInTheDocument();
    expect(screen.getByText(breadcrumbThree)).toBeInTheDocument();
  });

  it('should fire an event when a breadcrumb is clicked', () => {
    const handleClick = vi.fn();
    render(
      <Breadcrumbs
        breadcrumbItems={[
          ...breadcrumbItems,
          {
            label: 'Clickable',
            onClick: handleClick,
          },
        ]}
      />,
    );

    const clickableBreadcrumb = screen.getByText('Clickable');
    fireEvent.click(clickableBreadcrumb);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
