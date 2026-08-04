/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MenuItem } from '@/shared/types/menu-item';

import { WidgetHeaderMenu } from './widget-header-menu';

vi.mock('./widget-menu-button', () => ({
  WidgetMenuButton: ({ menuItems }: { menuItems: MenuItem[] }) => (
    <div data-testid="widget-menu-button" data-menu-items-count={menuItems.length}>
      Menu
    </div>
  ),
}));

describe('WidgetHeaderMenu', () => {
  it('does not render the menu button when config is undefined', () => {
    const { queryByTestId } = render(<WidgetHeaderMenu />);

    expect(queryByTestId('widget-menu-button')).not.toBeInTheDocument();
  });

  it('does not render the menu button when items is empty', () => {
    const { queryByTestId } = render(<WidgetHeaderMenu config={{ items: [] }} />);

    expect(queryByTestId('widget-menu-button')).not.toBeInTheDocument();
  });

  it('does not render the menu button when items is undefined', () => {
    const { queryByTestId } = render(<WidgetHeaderMenu config={{ enabled: true }} />);

    expect(queryByTestId('widget-menu-button')).not.toBeInTheDocument();
  });

  it('does not render the menu button when enabled is false', () => {
    const items: MenuItem[] = [
      { type: 'action', id: 'export', caption: 'Export', onClick: vi.fn() },
    ];
    const { queryByTestId } = render(<WidgetHeaderMenu config={{ enabled: false, items }} />);

    expect(queryByTestId('widget-menu-button')).not.toBeInTheDocument();
  });

  it('renders the menu button when enabled is undefined (default) and items are provided', () => {
    const items: MenuItem[] = [
      { type: 'action', id: 'export', caption: 'Export', onClick: vi.fn() },
    ];
    const { getByTestId } = render(<WidgetHeaderMenu config={{ items }} />);

    const menuButton = getByTestId('widget-menu-button');
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('data-menu-items-count', '1');
  });

  it('renders the menu button with all items when enabled is true', () => {
    const items: MenuItem[] = [
      { type: 'action', id: 'export', caption: 'Export', onClick: vi.fn() },
      { type: 'action', id: 'refresh', caption: 'Refresh', onClick: vi.fn() },
    ];
    const { getByTestId } = render(<WidgetHeaderMenu config={{ enabled: true, items }} />);

    expect(getByTestId('widget-menu-button')).toHaveAttribute('data-menu-items-count', '2');
  });
});
