import '@testing-library/jest-dom';
import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MenuItemSection } from '@/props';

import { DashboardHeaderTargets } from '../components/dashboard-header/dashboard-header-targets.js';
import { useDashboardHeaderMenuItem } from './use-dashboard-header-menu-item.js';

// Mock the theme context
const mockUseThemeContext = vi.fn();
vi.mock('@/infra/contexts/theme-provider', () => ({
  useThemeContext: () => mockUseThemeContext(),
}));

// Mock the useMenu hook
const mockOpenMenu = vi.fn();
const mockCloseMenu = vi.fn();
vi.mock('@/infra/contexts/menu-provider/hooks/use-menu', () => ({
  useMenu: () => ({
    openMenu: mockOpenMenu,
    closeMenu: mockCloseMenu,
  }),
}));

describe('useDashboardHeaderMenuItem', () => {
  const mockThemeSettings = {
    general: { backgroundColor: '#ffffff' },
    typography: { primaryTextColor: '#000000', fontFamily: 'Arial' },
    dashboard: {
      toolbar: {
        primaryTextColor: '#000000',
        secondaryTextColor: '#9EA2AB',
        backgroundColor: '#ffffff',
      },
    },
  };

  const mockMenuItemSections: MenuItemSection[] = [
    {
      items: [
        { caption: 'Item 1', onClick: vi.fn() },
        { caption: 'Item 2', onClick: vi.fn() },
      ],
    },
  ];

  beforeEach(() => {
    mockUseThemeContext.mockReturnValue({ themeSettings: mockThemeSettings });
    vi.clearAllMocks();
  });

  it('returns a visible menu item with the Menu target id when sections are provided', () => {
    const { result } = renderHook(() => useDashboardHeaderMenuItem(mockMenuItemSections));
    expect(result.current.id).toBe(DashboardHeaderTargets.Menu);
    expect(result.current.hidden).toBe(false);
  });

  it('renders the MenuButton when menuItemSections is not empty', () => {
    const { result } = renderHook(() => useDashboardHeaderMenuItem(mockMenuItemSections));
    const { getByTestId } = render(
      <>{result.current?.component({ size: { width: 28, height: 28 } })}</>,
    );
    expect(getByTestId('dashboard-toolbar-menu')).toBeInTheDocument();
  });

  it('returns a hidden (anchor-only) menu item when menuItemSections is empty', () => {
    const { result } = renderHook(() => useDashboardHeaderMenuItem([]));
    expect(result.current.id).toBe(DashboardHeaderTargets.Menu);
    expect(result.current.hidden).toBe(true);
  });

  it('calls openMenu with correct arguments when the MenuButton is clicked', () => {
    const { result } = renderHook(() => useDashboardHeaderMenuItem(mockMenuItemSections));
    const { getByTestId } = render(
      <>{result.current?.component({ size: { width: 28, height: 28 } })}</>,
    );
    const button = getByTestId('dashboard-toolbar-menu');

    const rect = {
      left: 10,
      top: 0,
      right: 30,
      bottom: 30,
      width: 20,
      height: 30,
      x: 10,
      y: 0,
      toJSON: () => {},
    };
    button.getBoundingClientRect = () => rect;

    act(() => {
      fireEvent.click(button, { target: button });
    });

    expect(mockOpenMenu).toHaveBeenCalledTimes(1);
    const callArgs = mockOpenMenu.mock.calls[0][0];
    expect(callArgs.position).toEqual({ left: 30, top: 30 });
    expect(callArgs.itemSections).toEqual(mockMenuItemSections);
    expect(callArgs.alignment).toEqual({ horizontal: 'right' });
  });

  it('wires item onClick through to the provided section item', () => {
    const { result } = renderHook(() => useDashboardHeaderMenuItem(mockMenuItemSections));
    const { getByTestId } = render(
      <>{result.current?.component({ size: { width: 28, height: 28 } })}</>,
    );
    const button = getByTestId('dashboard-toolbar-menu');

    button.getBoundingClientRect = () => ({ right: 30, bottom: 30 } as DOMRect);

    act(() => {
      fireEvent.click(button, { target: button });
    });

    const callArgs = mockOpenMenu.mock.calls[0][0];
    act(() => {
      callArgs.itemSections[0].items?.[0].onClick?.();
    });

    expect(mockMenuItemSections[0].items?.[0].onClick).toHaveBeenCalled();
  });
});
