import React from 'react';

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { DropdownButtonBody } from './DropdownButtonBody';

describe('DropdownButtonBody', () => {
  it('should render with selected item and icon', () => {
    const selectedItem = {
      caption: 'Selected Item',
      iconName: 'check-icon',
      id: 'selected-item-id',
    };

    const { container } = render(
      <DropdownButtonBody
        selectedItem={selectedItem}
        selectedShowIcon={true}
        placeholder="Placeholder"
      />,
    );

    expect(screen.getByText('Selected Item')).toBeInTheDocument();
    expect(screen.queryByText('Placeholder')).toBeNull();
    const icon = container.querySelector(`.app-icon.app-icon`);
    expect(icon).toBeInTheDocument();
  });

  it('should render with placeholder when no selected item', () => {
    render(
      <DropdownButtonBody
        selectedItem={undefined}
        selectedShowIcon={false}
        placeholder="No item selected"
      />,
    );

    expect(screen.getByText('No item selected')).toBeInTheDocument();
    expect(screen.queryByText('general-arrow-down')).toBeNull();
  });

  it('should render the default icon', () => {
    const selectedItem = {
      caption: 'Selected Item',
      iconName: 'check-icon',
      id: 'selected-item-id',
    };

    const { container } = render(
      <DropdownButtonBody selectedItem={selectedItem} selectedShowIcon={true} />,
    );

    const icon = container.querySelector(`.app-icon.app-icon--general-arrow-down`);
    expect(icon).toBeInTheDocument();
  });

  it('should render conditionally the custom icon when selectedShowIcon is true', () => {
    const selectedItem = {
      caption: 'Selected Item',
      iconName: 'check-icon',
      id: 'selected-item-id',
    };

    const { container } = render(
      <DropdownButtonBody selectedItem={selectedItem} selectedShowIcon={true} />,
    );

    const customIcon = container.querySelector(`.app-icon.app-icon--check-icon`);
    expect(customIcon).toBeInTheDocument();
  });

  it('should not render the custom icon when selectedShowIcon is false', () => {
    const selectedItem = {
      caption: 'Selected Item',
      iconName: 'check-icon',
      id: 'selected-item-id',
    };

    const { container } = render(
      <DropdownButtonBody selectedItem={selectedItem} selectedShowIcon={false} />,
    );

    const customIcon = container.querySelector(`.app-icon.app-icon--check-icon`);
    expect(customIcon).toBeNull();
  });

  it('should apply custom dropDownButtonClasses when provided', () => {
    const selectedItem = {
      caption: 'Selected Item',
      iconName: 'check-icon',
      id: 'selected-item-id',
    };
    const { container } = render(
      <DropdownButtonBody selectedItem={selectedItem} dropDownButtonClasses={'custom-class'} />,
    );

    const containerDiv = container.querySelector('.custom-class');

    expect(containerDiv).toBeInTheDocument();
  });

  it('should apply the width style when provided', () => {
    const selectedItem = {
      caption: 'Selected Item',
      iconName: 'check-icon',
      id: 'selected-item-id',
    };

    const { container } = render(
      <DropdownButtonBody
        dropDownButtonClasses={'custom-class'}
        selectedItem={selectedItem}
        width={200}
      />,
    );
    const containerDiv = container.querySelector('.custom-class');

    expect(containerDiv).toHaveStyle('width: 200px');
  });
});
