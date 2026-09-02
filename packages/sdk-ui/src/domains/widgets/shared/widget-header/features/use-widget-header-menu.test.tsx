/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { HeaderItem } from '@/domains/shared/header';

import type { WidgetHeaderMenuConfig } from '../types';
import { WidgetHeaderMenu } from '../widget-header-menu';
import { WidgetHeaderTargets } from '../widget-header-targets';
import { useWidgetHeaderMenu } from './use-widget-header-menu';

vi.mock('../widget-header-menu', () => ({
  WidgetHeaderMenu: vi.fn(() => <div data-testid="widget-header-menu">Menu</div>),
}));

const MENU_WITH_ITEM: WidgetHeaderMenuConfig = {
  items: [{ type: 'action', id: 'export', caption: 'Export', onClick: vi.fn() }],
};

/** Renders the item the hook contributed, the way the header's item cell would. */
const renderMenuItem = (menu?: WidgetHeaderMenuConfig) => {
  const result: { id?: string; defined?: boolean } = {};
  const Host = () => {
    const headerConfig = useWidgetHeaderMenu(menu ? { menu } : undefined);
    const item = (headerConfig.items as HeaderItem[] | undefined)?.[0];
    result.id = item?.id;
    result.defined = !!item;
    return <>{item?.component({ size: { width: 28, height: 28 } })}</>;
  };
  return { ...render(<Host />), result };
};

describe('useWidgetHeaderMenu', () => {
  it('contributes an item claiming the menu slot, and renders the button', () => {
    const { getByTestId, result } = renderMenuItem(MENU_WITH_ITEM);

    expect(result.id).toBe(WidgetHeaderTargets.Menu);
    expect(getByTestId('widget-header-menu')).toBeInTheDocument();
    expect(WidgetHeaderMenu).toHaveBeenCalledWith({ config: MENU_WITH_ITEM, size: 28 }, undefined);
  });

  it('contributes nothing when there is no menu config', () => {
    const { result, queryByTestId } = renderMenuItem(undefined);

    expect(result.defined).toBe(false);
    expect(queryByTestId('widget-header-menu')).not.toBeInTheDocument();
  });

  it('contributes nothing when the menu has no items', () => {
    const { result } = renderMenuItem({ items: [] });

    expect(result.defined).toBe(false);
  });

  it('contributes nothing when the menu is switched off', () => {
    const { result } = renderMenuItem({ ...MENU_WITH_ITEM, enabled: false });

    expect(result.defined).toBe(false);
  });
});
