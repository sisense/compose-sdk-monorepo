import { renderHook, act } from '@testing-library/react';
import { useDashboardHeaderToolbar } from './use-dashboard-header-toolbar';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the theme context
const mockUseThemeContext = vi.fn();
vi.mock('@/theme-provider', () => ({
  useThemeContext: () => mockUseThemeContext(),
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

  it('should render toolbar with menu items', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItems: mockMenuItems,
      }),
    );

    const toolbar = result.current.toolbar();
    expect(toolbar).toBeTruthy();
    expect(toolbar.props.children.length).toBe(2);
  });

  it('should not render toolbar when menuItems is empty', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItems: [],
      }),
    );

    const toolbar = result.current.toolbar();
    expect(toolbar.props.children[0]).toBeFalsy();
  });

  it('should open menu when clicking the icon button', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItems: mockMenuItems,
      }),
    );

    const toolbar = result.current.toolbar();
    const iconButton = toolbar.props.children[0];

    act(() => {
      iconButton.props.onClick({ currentTarget: document.createElement('button') });
    });

    const updatedToolbar = result.current.toolbar();
    const menu = updatedToolbar.props.children[1];
    expect(menu.props.open).toBe(true);
  });

  it('should close menu when clicking a menu item', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItems: mockMenuItems,
      }),
    );

    const toolbar = result.current.toolbar();
    const iconButton = toolbar.props.children[0];

    // Open menu
    act(() => {
      iconButton.props.onClick({ currentTarget: document.createElement('button') });
    });

    // Click menu item
    const updatedToolbar = result.current.toolbar();
    const menu = updatedToolbar.props.children[1];
    const menuItems = menu.props.children;

    act(() => {
      menuItems[0].props.onClick();
    });

    expect(mockMenuItems[0].onClick).toHaveBeenCalled();

    const finalToolbar = result.current.toolbar();
    const finalMenu = finalToolbar.props.children[1];
    expect(finalMenu.props.open).toBe(false);
  });

  it('should close menu when clicking outside', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItems: mockMenuItems,
      }),
    );

    const toolbar = result.current.toolbar();
    const iconButton = toolbar.props.children[0];

    // Open menu
    act(() => {
      iconButton.props.onClick({ currentTarget: document.createElement('button') });
    });

    // Close menu
    const updatedToolbar = result.current.toolbar();
    const menu = updatedToolbar.props.children[1];

    act(() => {
      menu.props.onClose();
    });

    const finalToolbar = result.current.toolbar();
    const finalMenu = finalToolbar.props.children[1];
    expect(finalMenu.props.open).toBe(false);
  });

  it('should render menu items with correct styles', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItems: mockMenuItems,
      }),
    );

    const toolbar = result.current.toolbar();
    const menu = toolbar.props.children[1];
    const menuItems = menu.props.children;

    expect(menuItems[0].props.sx).toEqual({
      fontSize: '13px',
      fontFamily: mockThemeSettings.typography.fontFamily,
      color: mockThemeSettings.typography.primaryTextColor,
    });
  });
});
