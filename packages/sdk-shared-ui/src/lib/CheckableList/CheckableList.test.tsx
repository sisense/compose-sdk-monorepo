import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';

import { CheckableList } from './CheckableList';

import '@testing-library/jest-dom';

describe('CheckableList', () => {
  const items = [
    { name: 'Item 1', value: 'item1', checked: true, dataTestId: 'item-1' },
    { name: 'Item 2', value: 'item2', checked: false, dataTestId: 'item-2' },
  ];

  it('should render all items', () => {
    render(<CheckableList items={items} onChange={vi.fn()} className="custom-class" />);

    items.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByTestId(item.dataTestId)).toBeInTheDocument();
    });
  });

  it('should call onChange with the correct value when an item is clicked', () => {
    const onChangeMock = vi.fn();
    render(<CheckableList items={items} onChange={onChangeMock} className="custom-class" />);

    const firstItem = screen.getByTestId('item-1');
    fireEvent.click(firstItem);

    expect(onChangeMock).toHaveBeenCalledWith('item1');
  });

  it('should render DEPRECATED_Icon for checked items', () => {
    const { container } = render(
      <CheckableList items={items} onChange={vi.fn()} className="custom-class" />,
    );

    const icon = container.querySelector(`.app-icon.app-icon--general-vi-small-white`);

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('app-icon app-icon--general-vi-small-white');
  });

  it('should not render DEPRECATED_Icon for unchecked items', () => {
    render(<CheckableList items={items} onChange={vi.fn()} className="custom-class" />);

    const uncheckedItem = screen.getByTestId('item-2');
    const icon = uncheckedItem.querySelector(`.app-icon.app-icon--general-vi-small-white`);

    expect(icon).toBeNull();
  });

  it('should apply custom className to the container', () => {
    const { container } = render(
      <CheckableList items={items} onChange={vi.fn()} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
