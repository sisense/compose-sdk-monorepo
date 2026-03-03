/** @vitest-environment jsdom */
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, Mock, vi } from 'vitest';

import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu';
import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context';
import { MenuItem } from '@/shared/types/menu-item';

import { FilterTileMenuButton } from './filter-tile-menu-button.js';

vi.mock('@/infra/contexts/menu-provider/hooks/use-menu', () => ({
  useMenu: vi.fn(),
}));

vi.mock('@/infra/contexts/theme-provider/theme-context', () => ({
  useThemeContext: vi.fn(),
}));

vi.mock('@/shared/components/menu/menu-button', () => ({
  MenuButton: ({
    onClick,
    ariaLabel,
    color,
    size,
  }: {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    ariaLabel: string;
    color: string;
    size?: number;
  }) => (
    <button
      type="button"
      data-testid="filter-tile-menu-button"
      onClick={onClick}
      aria-label={ariaLabel}
      data-color={color}
      data-size={size}
    >
      Menu
    </button>
  ),
}));

const mockUseMenu = useMenu as Mock;
const mockUseThemeContext = useThemeContext as Mock;

describe('FilterTileMenuButton', () => {
  const mockOpenMenu = vi.fn();
  const primaryTextColor = '#2b2b2b';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMenu.mockReturnValue({ openMenu: mockOpenMenu });
    mockUseThemeContext.mockReturnValue({
      themeSettings: {
        typography: {
          primaryTextColor,
        },
      },
    });
  });

  it('calls openMenu with position, alignment and itemSections with mapped items when clicked', () => {
    const onClick1 = vi.fn();
    const onClick2 = vi.fn();
    const menuItems: MenuItem[] = [
      { id: 'lock', caption: 'Lock', onClick: onClick1 },
      { id: 'custom', caption: 'Custom action', onClick: onClick2 },
    ];
    const { getByTestId } = render(<FilterTileMenuButton menuItems={menuItems} />);

    const button = getByTestId('filter-tile-menu-button');
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      right: 100,
      bottom: 50,
    } as DOMRect);

    fireEvent.click(button);

    expect(mockOpenMenu).toHaveBeenCalledTimes(1);
    expect(mockOpenMenu).toHaveBeenCalledWith({
      position: { left: 100, top: 50 },
      alignment: { horizontal: 'right' },
      itemSections: [
        {
          items: [
            { key: 'lock', caption: 'Lock', onClick: onClick1 },
            { key: 'custom', caption: 'Custom action', onClick: onClick2 },
          ],
        },
      ],
    });
  });
});
