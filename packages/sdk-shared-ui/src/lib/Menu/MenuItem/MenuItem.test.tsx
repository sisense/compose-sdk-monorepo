import React from 'react';

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import styles from '../Menu.module.scss';
import { itemTypes, MenuItem } from './MenuItem';

describe('MenuItem Component', () => {
  test('should render a basic menu item', () => {
    render(
      <MenuItem
        handleClick={vi.fn()}
        caption="Test Item"
        type={itemTypes.ITEM}
        dataTestId="menu-item"
      />,
    );

    const menuItem = screen.getByTestId('menu-item');

    expect(menuItem).toBeInTheDocument();
    expect(menuItem).toHaveClass(styles.menuItemText);
    expect(menuItem).toHaveTextContent('Test Item');
  });

  test('should trigger handleClick on click', () => {
    const mockHandleClick = vi.fn();
    render(
      <MenuItem
        handleClick={mockHandleClick}
        caption="Test Item"
        type={itemTypes.ITEM}
        dataTestId="menu-item"
      />,
    );

    const menuItem = screen.getByTestId('menu-item');
    fireEvent.click(menuItem);

    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });

  test('should not trigger handleClick when disabled', () => {
    const mockHandleClick = vi.fn();
    render(
      <MenuItem
        handleClick={mockHandleClick}
        caption="Test Item"
        type={itemTypes.ITEM}
        dataTestId="menu-item"
        disabled={true}
      />,
    );

    const menuItem = screen.getByTestId('menu-item');
    fireEvent.click(menuItem);

    expect(mockHandleClick).not.toHaveBeenCalled();
  });

  test('should render a radio button when type is RADIO', () => {
    render(
      <MenuItem
        handleClick={vi.fn()}
        caption="Test Item"
        type={itemTypes.RADIO}
        dataTestId="menu-item"
        checked={true}
      />,
    );

    expect(screen.getByRole('radio')).toBeChecked();
  });

  test('should render a checkbox when type is CHECKBOX', () => {
    render(
      <MenuItem
        handleClick={vi.fn()}
        caption="Test Item"
        type={itemTypes.CHECKBOX}
        dataTestId="menu-item"
        checked={true}
      />,
    );

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  test('should render a toggle when type is TOGGLE', () => {
    render(
      <MenuItem
        handleClick={vi.fn()}
        caption="Test Item"
        type={itemTypes.TOGGLE}
        dataTestId="menu-item"
        checked={true}
      />,
    );

    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  test('should render nested content when type is NESTED', () => {
    render(
      <MenuItem
        handleClick={vi.fn()}
        caption="Test Item"
        type={itemTypes.NESTED}
        dataTestId="menu-item"
        subCaption="Sub Item"
      />,
    );

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Sub Item')).toBeInTheDocument();
  });

  test('should render icon component when type is NESTED', () => {
    const { container } = render(
      <MenuItem
        handleClick={vi.fn()}
        caption="Test Item"
        type={itemTypes.NESTED}
        dataTestId="menu-item"
        subCaption="Sub Item"
      />,
    );

    const icon = container.querySelector('.app-icon--general-double-arrow-front');

    expect(icon).toBeInTheDocument();
  });

  test('should render icon component when type is ITEM and selected', () => {
    const { container } = render(
      <MenuItem
        handleClick={vi.fn()}
        caption="Test Item"
        type={itemTypes.ITEM}
        dataTestId="menu-item"
        selected={true}
      />,
    );

    const icon = container.querySelector('.app-icon--general-vi-small-white');

    expect(icon).toBeInTheDocument();
  });

  test('should render tooltip if provided', () => {
    render(
      <MenuItem
        handleClick={vi.fn()}
        caption="Test Item"
        type={itemTypes.ITEM}
        dataTestId="menu-item"
        tooltip="Tooltip text"
      />,
    );

    const tooltipTrigger = screen.getByTestId('menu-item');
    fireEvent.mouseOver(tooltipTrigger);

    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  test('should apply the correct classes when checked', () => {
    render(
      <MenuItem
        handleClick={vi.fn()}
        caption="Test Item"
        type={itemTypes.ITEM}
        dataTestId="menu-item"
        checked={true}
      />,
    );

    const menuItem = screen.getByRole('listitem');

    expect(menuItem).toHaveClass(styles.checked);
  });

  test('should apply the correct classes when disabled', () => {
    render(
      <MenuItem
        handleClick={vi.fn()}
        caption="Test Item"
        type={itemTypes.ITEM}
        dataTestId="menu-item"
        disabled={true}
      />,
    );

    const menuItem = screen.getByRole('listitem');

    expect(menuItem).toHaveClass(styles.disabled);
  });

  test('should call handleOver on hover', () => {
    const mockHandleOver = vi.fn();

    render(
      <MenuItem
        handleClick={vi.fn()}
        caption="Test Item"
        type={itemTypes.ITEM}
        dataTestId="menu-item"
        disabled={true}
        handleOver={mockHandleOver}
      />,
    );

    const menuItem = screen.getByTestId('menu-item');
    fireEvent.mouseOver(menuItem);

    expect(mockHandleOver).toHaveBeenCalledTimes(1);
  });

  test('should call handleOut on hover', () => {
    const mockHandleOut = vi.fn();

    render(
      <MenuItem
        handleClick={vi.fn()}
        caption="Test Item"
        type={itemTypes.ITEM}
        dataTestId="menu-item"
        disabled={true}
        handleOver={vi.fn()}
        handleOut={mockHandleOut}
      />,
    );

    const menuItem = screen.getByTestId('menu-item');
    fireEvent.mouseOver(menuItem);
    fireEvent.mouseOut(menuItem);

    expect(mockHandleOut).toHaveBeenCalledTimes(1);
  });
});
