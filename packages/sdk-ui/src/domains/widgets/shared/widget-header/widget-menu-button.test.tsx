/** @vitest-environment jsdom */
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, Mock, vi } from 'vitest';

import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu';
import { useThemeContext } from '@/infra/contexts/theme-provider/theme-context';

import type { MenuItem } from './types';
import { WidgetMenuButton } from './widget-menu-button';

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
  }: {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    ariaLabel: string;
    color: string;
  }) => (
    <button
      type="button"
      data-testid="widget-menu-button"
      onClick={onClick}
      aria-label={ariaLabel}
      data-color={color}
    >
      Menu
    </button>
  ),
}));

const mockUseMenu = useMenu as Mock;
const mockUseThemeContext = useThemeContext as Mock;

describe('WidgetMenuButton', () => {
  const mockOpenMenu = vi.fn();
  const titleTextColor = '#1a1a1a';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMenu.mockReturnValue({ openMenu: mockOpenMenu });
    mockUseThemeContext.mockReturnValue({
      themeSettings: {
        widget: {
          header: {
            titleTextColor,
          },
        },
      },
    });
  });

  it('renders a menu button with correct aria-label', () => {
    const { getByRole } = render(
      <WidgetMenuButton menuItems={[{ id: 'item-1', caption: 'Item 1', onClick: vi.fn() }]} />,
    );

    const button = getByRole('button', { name: 'widget header toolbar menu' });
    expect(button).toBeInTheDocument();
  });

  it('passes theme titleTextColor to MenuButton', () => {
    const { getByTestId } = render(
      <WidgetMenuButton menuItems={[{ id: 'item-1', caption: 'Item 1', onClick: vi.fn() }]} />,
    );

    expect(getByTestId('widget-menu-button')).toHaveAttribute('data-color', titleTextColor);
  });

  it('does not call openMenu when menuItems is empty and button is clicked', () => {
    const { getByTestId } = render(<WidgetMenuButton menuItems={[]} />);

    fireEvent.click(getByTestId('widget-menu-button'));

    expect(mockOpenMenu).not.toHaveBeenCalled();
  });

  it('calls openMenu with position, alignment and itemSections when clicked with non-empty menuItems', () => {
    const menuItems: MenuItem[] = [
      { id: 'export', caption: 'Export', onClick: vi.fn() },
      { id: 'refresh', caption: 'Refresh', onClick: vi.fn() },
    ];
    const { getByTestId } = render(<WidgetMenuButton menuItems={menuItems} />);

    fireEvent.click(getByTestId('widget-menu-button'), {
      clientX: 100,
      clientY: 200,
    });

    expect(mockOpenMenu).toHaveBeenCalledTimes(1);
    expect(mockOpenMenu).toHaveBeenCalledWith({
      position: { left: 100, top: 200 },
      alignment: { horizontal: 'right' },
      itemSections: [{ items: menuItems }],
    });
  });

  it('stops propagation of click event', () => {
    const menuItems: MenuItem[] = [{ id: 'item-1', caption: 'Item 1', onClick: vi.fn() }];
    const { getByTestId } = render(<WidgetMenuButton menuItems={menuItems} />);

    const button = getByTestId('widget-menu-button');
    const event = new MouseEvent('click', { bubbles: true, clientX: 50, clientY: 60 });
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

    fireEvent(button, event);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});
