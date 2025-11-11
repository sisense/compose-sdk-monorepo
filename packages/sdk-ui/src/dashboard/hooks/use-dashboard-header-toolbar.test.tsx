import '@testing-library/jest-dom';
import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MenuItemSection } from '@/index';

import { useDashboardHeaderToolbar } from './use-dashboard-header-toolbar';

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

  const mockMenuItemSections: MenuItemSection[] = [
    {
      items: [
        {
          caption: 'Item 1',
          onClick: vi.fn(),
        },
        {
          caption: 'Item 2',
          onClick: vi.fn(),
        },
      ],
    },
  ];

  beforeEach(() => {
    mockUseThemeContext.mockReturnValue({
      themeSettings: mockThemeSettings,
    });
    vi.clearAllMocks();
  });

  it('should render MenuButton when menuItemSections is not empty', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItemSections: mockMenuItemSections,
      }),
    );
    const { getByTestId } = render(result.current.toolbar());
    const button = getByTestId('dashboard-toolbar-menu');
    expect(button).toBeInTheDocument();
  });

  it('should not render MenuButton when menuItemSections is empty', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItemSections: [],
      }),
    );

    const { queryByTestId } = render(result.current.toolbar());
    expect(queryByTestId('dashboard-toolbar-menu')).toBeNull();
  });

  it('should call openMenu with correct arguments when MenuButton is clicked', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItemSections: mockMenuItemSections,
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
    expect(callArgs.itemSections).toEqual(mockMenuItemSections);
    expect(callArgs.alignment).toEqual({ horizontal: 'right' });
    expect(callArgs.itemSections[0].items?.length).toBe(2);
    expect(callArgs.itemSections[0].items?.[0].caption).toBe('Item 1');
    expect(typeof callArgs.itemSections[0].items?.[0].onClick).toBe('function');
  });

  it('should call item onClick when menu item is clicked', () => {
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItemSections: mockMenuItemSections,
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
    const firstItemOnClick = callArgs.itemSections[0].items?.[0].onClick;
    expect(firstItemOnClick).toBeDefined();

    act(() => {
      firstItemOnClick?.();
    });

    expect(mockMenuItemSections[0].items?.[0].onClick).toHaveBeenCalled();
  });

  it('should render toolbarComponents when provided', () => {
    const mockToolbarComponents = [<div key="test">Test Component</div>];
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItemSections: [],
        toolbarComponents: mockToolbarComponents,
      }),
    );

    const { getByText } = render(result.current.toolbar());
    const toolbarComponent = getByText('Test Component');
    expect(toolbarComponent).toBeInTheDocument();
  });

  it('should render both toolbarComponents and MenuButton when both are provided', () => {
    const mockToolbarComponents = [<div key="test">Test Component</div>];
    const { result } = renderHook(() =>
      useDashboardHeaderToolbar({
        menuItemSections: mockMenuItemSections,
        toolbarComponents: mockToolbarComponents,
      }),
    );

    const { getByText, getByTestId } = render(result.current.toolbar());
    const toolbarComponent = getByText('Test Component');
    const button = getByTestId('dashboard-toolbar-menu');

    expect(toolbarComponent).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });
});
