/* eslint-disable vitest/no-commented-out-tests */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { useCombinedMenu, IsTargetMenuFn, CombineMenusFn } from './use-combined-menu';
import { useMenu } from './use-menu';

// Mock the useMenu hook so we can spy on its return value
vi.mock('./use-menu', () => ({
  useMenu: vi.fn(),
}));

describe('useCombinedMenu', () => {
  const openMenuMock = vi.fn();

  // Each test re-mocks and resets function calls
  beforeEach(() => {
    vi.clearAllMocks();
    (useMenu as unknown as Mock).mockReturnValue({
      openMenu: openMenuMock,
    });
  });

  it('should open the menu with currentMenuOptions when openMenu is called', () => {
    const isTargetMenu: IsTargetMenuFn = () => false;
    const combineMenus: CombineMenusFn = (current) => current;

    const { result } = renderHook(() => useCombinedMenu({ isTargetMenu, combineMenus }));

    result.current.openMenu({
      position: {
        left: 42,
        top: 69,
      },
      itemSections: [{ sectionTitle: 'Some Section', items: [] }],
    });

    // It should have been called with our menu options
    expect(openMenuMock).toHaveBeenCalledOnce();
    expect(openMenuMock.mock.calls[0]).toMatchSnapshot();
  });
});
