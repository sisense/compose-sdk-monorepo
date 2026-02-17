import { describe, expect, it, vi } from 'vitest';

import type { WidgetProps } from '../components/widget/types';
import type { MenuItem } from '../shared/widget-header/types';
import { withHeaderMenuItem } from './header-menu-utils.js';

const createMinimalWidgetProps = (overrides?: Partial<WidgetProps>): WidgetProps =>
  ({
    id: 'widget-1',
    widgetType: 'chart',
    config: overrides?.config,
    ...overrides,
  } as WidgetProps);

const createMenuItem = (overrides?: Partial<MenuItem>): MenuItem => ({
  id: 'menu-item-1',
  caption: 'Custom action',
  onClick: vi.fn(),
  ...overrides,
});

describe('withHeaderMenuItem', () => {
  it('returns a function that adds a menu item to widget props', () => {
    const menuItem = createMenuItem();
    const enhancer = withHeaderMenuItem(menuItem);
    expect(typeof enhancer).toBe('function');
    const result = enhancer(createMinimalWidgetProps());
    expect(result.config?.header?.toolbar?.menu?.items).toEqual([menuItem]);
  });

  it('adds menu item when widget has no config', () => {
    const menuItem = createMenuItem({ id: 'new-item' });
    const widget = createMinimalWidgetProps({ config: undefined });
    const result = withHeaderMenuItem(menuItem)(widget);
    expect(result.config?.header?.toolbar?.menu?.items).toEqual([menuItem]);
  });

  it('adds menu item when widget has config but no header', () => {
    const menuItem = createMenuItem();
    const widget = createMinimalWidgetProps({ config: {} });
    const result = withHeaderMenuItem(menuItem)(widget);
    expect(result.config?.header?.toolbar?.menu?.items).toEqual([menuItem]);
  });

  it('adds menu item when widget has header but no toolbar', () => {
    const menuItem = createMenuItem();
    const widget = createMinimalWidgetProps({
      config: { header: {} },
    });
    const result = withHeaderMenuItem(menuItem)(widget);
    expect(result.config?.header?.toolbar?.menu?.items).toEqual([menuItem]);
  });

  it('adds menu item when widget has toolbar but no menu', () => {
    const menuItem = createMenuItem();
    const widget = createMinimalWidgetProps({
      config: { header: { toolbar: {} } },
    });
    const result = withHeaderMenuItem(menuItem)(widget);
    expect(result.config?.header?.toolbar?.menu?.items).toEqual([menuItem]);
  });

  it('appends menu item to existing items', () => {
    const existingItem = createMenuItem({ id: 'existing', caption: 'Existing' });
    const newItem = createMenuItem({ id: 'new', caption: 'New' });
    const widget = createMinimalWidgetProps({
      config: {
        header: {
          toolbar: {
            menu: { items: [existingItem] },
          },
        },
      },
    });
    const result = withHeaderMenuItem(newItem)(widget);
    expect(result.config?.header?.toolbar?.menu?.items).toEqual([existingItem, newItem]);
  });

  it('preserves other widget props (id, widgetType)', () => {
    const menuItem = createMenuItem();
    const widget = createMinimalWidgetProps({ id: 'my-widget', widgetType: 'chart' });
    const result = withHeaderMenuItem(menuItem)(widget);
    expect(result.id).toBe('my-widget');
    expect(result.widgetType).toBe('chart');
  });

  it('preserves existing header.toolbar.menu options (e.g. enabled)', () => {
    const menuItem = createMenuItem();
    const widget = createMinimalWidgetProps({
      config: {
        header: {
          toolbar: {
            menu: { enabled: false, items: [] },
          },
        },
      },
    });
    const result = withHeaderMenuItem(menuItem)(widget);
    expect(result.config?.header?.toolbar?.menu?.enabled).toBe(false);
    expect(result.config?.header?.toolbar?.menu?.items).toEqual([menuItem]);
  });

  it('does not mutate the original widget props', () => {
    const menuItem = createMenuItem();
    const widget = createMinimalWidgetProps({
      config: {
        header: {
          toolbar: {
            menu: { items: [createMenuItem({ id: 'original' })] },
          },
        },
      },
    });
    const originalItems = widget.config?.header?.toolbar?.menu?.items;
    withHeaderMenuItem(menuItem)(widget);
    expect(widget.config?.header?.toolbar?.menu?.items).toBe(originalItems);
    expect(widget.config?.header?.toolbar?.menu?.items).toHaveLength(1);
  });

  it('can be composed: multiple enhancers add items in order', () => {
    const item1 = createMenuItem({ id: 'first', caption: 'First' });
    const item2 = createMenuItem({ id: 'second', caption: 'Second' });
    const widget = createMinimalWidgetProps();
    const enhancer1 = withHeaderMenuItem(item1);
    const enhancer2 = withHeaderMenuItem(item2);
    const result = enhancer2(enhancer1(widget));
    expect(result.config?.header?.toolbar?.menu?.items).toEqual([item1, item2]);
  });
});
