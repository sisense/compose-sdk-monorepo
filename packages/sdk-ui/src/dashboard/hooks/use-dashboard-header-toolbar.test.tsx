import { renderHook, act, render, fireEvent } from '@testing-library/react';
import { useDashboardHeaderToolbar } from './use-dashboard-header-toolbar';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the theme context
const mockUseThemeContext = vi.fn();
vi.mock('@/theme-provider', () => ({
  useThemeContext: () => mockUseThemeContext(),
}));

// Mock the useMenu hook
const mockOpenMenu = vi.fn();
const mockCloseMenu = vi.fn();
vi.mock('@/common/hooks/use-menu', () => ({
  useMenu: () => ({
    openMenu: mockOpenMenu,
    closeMenu: mockCloseMenu,
  }),
}));

describe('useDashboardHeaderToolbar', () => {
  const mockThemeSettings = {
    general: {
      backgroundColor: '#ffffff',
    },
    typography: {
      primaryTextColor: '#000000',
      fontFamily: 'Arial',
    },
    dashboard: {
      toolbar: {
        primaryTextColor: '#000000',
        secondaryTextColor: '#9EA2AB',
        backgroundColor: '#ffffff',
      },
    },
  };

  const mockMenuItems = [
    {
      title: 'Item 1',
      onClick: vi.fn(),
    },
    {
      title: 'Item 2',
      icon: <span>Icon</span>,
      onClick: vi.fn(),
    },
  ];

  beforeEach(() => {
    mockUseThemeContext.mockReturnValue({
      themeSettings: mockThemeSettings,
    });
    vi.clearAllMocks();
  });

  it('should render MenuButton when menuItems is not empty', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItems: mockMenuItems,
      }),
    );
    const { getByTestId } = render(result.current.toolbar());
    const button = getByTestId('dashboard-toolbar-menu');
    expect(button).toBeInTheDocument();
  });

  it('should not render MenuButton when menuItems is empty', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItems: [],
      }),
    );

    const { queryByTestId } = render(result.current.toolbar());
    expect(queryByTestId('dashboard-toolbar-menu')).toBeNull();
  });

  it('should call openMenu with correct arguments when MenuButton is clicked', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItems: mockMenuItems,
      }),
    );

    const { getByTestId } = render(result.current.toolbar());
    const button = getByTestId('dashboard-toolbar-menu');

    // Patch the button to mock getBoundingClientRect on the event target
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
    expect(callArgs.position).toEqual({ left: 20, top: 30 });
    expect(callArgs.itemSections[0].items.length).toBe(2);
    expect(callArgs.itemSections[0].items[0].caption).toBe('Item 1');
    expect(typeof callArgs.itemSections[0].items[0].onClick).toBe('function');
  });

  it('should call item onClick and closeMenu when menu item is clicked', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItems: mockMenuItems,
      }),
    );

    const { getByTestId } = render(result.current.toolbar());
    const button = getByTestId('dashboard-toolbar-menu');

    // Patch the button to mock getBoundingClientRect on the event target
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

    // Simulate clicking the first menu item
    const callArgs = mockOpenMenu.mock.calls[0][0];
    act(() => {
      callArgs.itemSections[0].items[0].onClick();
    });

    expect(mockMenuItems[0].onClick).toHaveBeenCalled();
    expect(mockCloseMenu).toHaveBeenCalled();
  });
});
