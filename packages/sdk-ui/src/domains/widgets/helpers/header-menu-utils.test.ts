import { describe, expect, it, vi } from 'vitest';

import type { MenuActionItem } from '@/shared/types/menu-item';

import type { WidgetProps } from '../components/widget/types';
import { WidgetHeaderMenuTargets } from '../shared/widget-header/widget-header-menu-targets';
import {
  withBuiltInMenuItem,
  withHeaderMenuItem,
  withMenuItemInHeaderConfig,
} from './header-menu-utils.js';

const createMinimalWidgetProps = (overrides?: Partial<WidgetProps>): WidgetProps =>
  ({
    id: 'widget-1',
    widgetType: 'chart',
    config: overrides?.config,
    ...overrides,
  } as WidgetProps);

const createMenuItem = (overrides?: Partial<MenuActionItem>): MenuActionItem => ({
  type: 'action',
  id: 'menu-item-1',
  caption: 'Custom action',
  onClick: vi.fn(),
  ...overrides,
});

describe('withBuiltInMenuItem', () => {
  const renameItem = createMenuItem({ id: WidgetHeaderMenuTargets.RenameWidget });
  const downloadItem = createMenuItem({ id: WidgetHeaderMenuTargets.Download });
  const customItem = createMenuItem({ id: 'custom', caption: 'Custom' });

  it('adds the item to an empty list', () => {
    expect(withBuiltInMenuItem([], renameItem)).toEqual([renameItem]);
  });

  it('places the built-in before custom items', () => {
    expect(withBuiltInMenuItem([customItem], renameItem)).toEqual([renameItem, customItem]);
  });

  it('places the built-in after other built-ins, preserving their order', () => {
    expect(withBuiltInMenuItem([renameItem, customItem], downloadItem)).toEqual([
      renameItem,
      downloadItem,
      customItem,
    ]);
  });

  it('moves custom items after built-ins even when they were declared first', () => {
    const otherCustom = createMenuItem({ id: 'custom-2', caption: 'Custom 2' });
    expect(withBuiltInMenuItem([customItem, renameItem, otherCustom], downloadItem)).toEqual([
      renameItem,
      downloadItem,
      customItem,
      otherCustom,
    ]);
  });

  it('does not mutate the input list', () => {
    const items = [customItem];
    withBuiltInMenuItem(items, renameItem);
    expect(items).toEqual([customItem]);
  });
});

describe('withMenuItemInHeaderConfig', () => {
  it('returns a transformer that adds a menu item to header config', () => {
    const menuItem = createMenuItem();
    const transform = withMenuItemInHeaderConfig(menuItem);
    const result = transform({});
    expect(result.menu?.items).toEqual([menuItem]);
  });

  it('adds the built-in menu item before existing custom items', () => {
    const customItem = createMenuItem({ id: 'custom', caption: 'Custom' });
    const builtInItem = createMenuItem({
      id: WidgetHeaderMenuTargets.RenameWidget,
      caption: 'Rename widget',
    });
    const headerConfig = {
      menu: { items: [customItem] },
    };
    const result = withMenuItemInHeaderConfig(builtInItem)(headerConfig);
    expect(result.menu?.items).toEqual([builtInItem, customItem]);
  });

  it('adds the built-in menu item after existing built-in items', () => {
    const existingBuiltIn = createMenuItem({
      id: WidgetHeaderMenuTargets.DuplicateWidget,
      caption: 'Duplicate widget',
    });
    const customItem = createMenuItem({ id: 'custom', caption: 'Custom' });
    const newBuiltIn = createMenuItem({
      id: WidgetHeaderMenuTargets.RenameWidget,
      caption: 'Rename widget',
    });
    const headerConfig = {
      menu: { items: [existingBuiltIn, customItem] },
    };
    const result = withMenuItemInHeaderConfig(newBuiltIn)(headerConfig);
    expect(result.menu?.items).toEqual([existingBuiltIn, newBuiltIn, customItem]);
  });

  it('preserves other header config (e.g. title)', () => {
    const menuItem = createMenuItem();
    const headerConfig = { title: { editing: { enabled: true } } };
    const result = withMenuItemInHeaderConfig(menuItem)(headerConfig);
    expect(result.title).toEqual({ editing: { enabled: true } });
    expect(result.menu?.items).toEqual([menuItem]);
  });

  it('preserves existing menu options (e.g. enabled)', () => {
    const menuItem = createMenuItem();
    const headerConfig = {
      menu: { enabled: false, items: [] },
    };
    const result = withMenuItemInHeaderConfig(menuItem)(headerConfig);
    expect(result.menu?.enabled).toBe(false);
    expect(result.menu?.items).toEqual([menuItem]);
  });

  it('does not mutate the input header config', () => {
    const menuItem = createMenuItem();
    const headerConfig = {
      menu: { items: [createMenuItem({ id: 'original' })] },
    };
    const originalItems = headerConfig.menu?.items;
    withMenuItemInHeaderConfig(menuItem)(headerConfig);
    expect(headerConfig.menu?.items).toBe(originalItems);
    expect(headerConfig.menu?.items).toHaveLength(1);
  });
});

describe('withHeaderMenuItem', () => {
  it('returns a function that adds a menu item to widget props', () => {
    const menuItem = createMenuItem();
    const enhancer = withHeaderMenuItem(menuItem);
    expect(typeof enhancer).toBe('function');
    const result = enhancer(createMinimalWidgetProps());
    expect(result.config?.header?.menu?.items).toEqual([menuItem]);
  });

  it('adds menu item when widget has no config', () => {
    const menuItem = createMenuItem({ id: 'new-item' });
    const widget = createMinimalWidgetProps({ config: undefined });
    const result = withHeaderMenuItem(menuItem)(widget);
    expect(result.config?.header?.menu?.items).toEqual([menuItem]);
  });

  it('adds menu item when widget has config but no header', () => {
    const menuItem = createMenuItem();
    const widget = createMinimalWidgetProps({ config: {} });
    const result = withHeaderMenuItem(menuItem)(widget);
    expect(result.config?.header?.menu?.items).toEqual([menuItem]);
  });

  it('adds menu item when widget has header but no menu', () => {
    const menuItem = createMenuItem();
    const widget = createMinimalWidgetProps({
      config: { header: {} },
    });
    const result = withHeaderMenuItem(menuItem)(widget);
    expect(result.config?.header?.menu?.items).toEqual([menuItem]);
  });

  it('adds menu item when widget has menu but no items', () => {
    const menuItem = createMenuItem();
    const widget = createMinimalWidgetProps({
      config: { header: { menu: {} } },
    });
    const result = withHeaderMenuItem(menuItem)(widget);
    expect(result.config?.header?.menu?.items).toEqual([menuItem]);
  });

  it('adds the built-in menu item before existing custom items', () => {
    const customItem = createMenuItem({ id: 'custom', caption: 'Custom' });
    const builtInItem = createMenuItem({
      id: WidgetHeaderMenuTargets.DeleteWidget,
      caption: 'Delete widget',
    });
    const widget = createMinimalWidgetProps({
      config: {
        header: {
          menu: { items: [customItem] },
        },
      },
    });
    const result = withHeaderMenuItem(builtInItem)(widget);
    expect(result.config?.header?.menu?.items).toEqual([builtInItem, customItem]);
  });

  it('preserves other widget props (id, widgetType)', () => {
    const menuItem = createMenuItem();
    const widget = createMinimalWidgetProps({ id: 'my-widget', widgetType: 'chart' });
    const result = withHeaderMenuItem(menuItem)(widget);
    expect(result.id).toBe('my-widget');
    expect(result.widgetType).toBe('chart');
  });

  it('preserves existing header.menu options (e.g. enabled)', () => {
    const menuItem = createMenuItem();
    const widget = createMinimalWidgetProps({
      config: {
        header: {
          menu: { enabled: false, items: [] },
        },
      },
    });
    const result = withHeaderMenuItem(menuItem)(widget);
    expect(result.config?.header?.menu?.enabled).toBe(false);
    expect(result.config?.header?.menu?.items).toEqual([menuItem]);
  });

  it('does not mutate the original widget props', () => {
    const menuItem = createMenuItem();
    const widget = createMinimalWidgetProps({
      config: {
        header: {
          menu: { items: [createMenuItem({ id: 'original' })] },
        },
      },
    });
    const originalItems = widget.config?.header?.menu?.items;
    withHeaderMenuItem(menuItem)(widget);
    expect(widget.config?.header?.menu?.items).toBe(originalItems);
    expect(widget.config?.header?.menu?.items).toHaveLength(1);
  });

  it('can be composed: built-ins keep contribution order and lead custom items', () => {
    const customItem = createMenuItem({ id: 'custom', caption: 'Custom' });
    const item1 = createMenuItem({
      id: WidgetHeaderMenuTargets.DeleteWidget,
      caption: 'Delete widget',
    });
    const item2 = createMenuItem({
      id: WidgetHeaderMenuTargets.DistributeEqualWidth,
      caption: 'Distribute equal width',
    });
    const widget = createMinimalWidgetProps({
      config: { header: { menu: { items: [customItem] } } },
    });
    const enhancer1 = withHeaderMenuItem(item1);
    const enhancer2 = withHeaderMenuItem(item2);
    const result = enhancer2(enhancer1(widget));
    expect(result.config?.header?.menu?.items).toEqual([item1, item2, customItem]);
  });
});
