/** @vitest-environment jsdom */
import { act } from 'react';

import { render, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, Mock, vi } from 'vitest';

import type { HeaderItem } from '@/domains/shared/header';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { findMenuActionByPath } from '@/shared/types/__test-helpers__/find-menu-item.js';

import type { WidgetHeaderConfig } from '../types';
import { WidgetHeaderMenuTargets } from '../widget-header-menu-targets';
import { WidgetHeaderTargets } from '../widget-header-targets';
import { useWidgetHeaderTitle, UseWidgetHeaderTitleParams } from './use-widget-header-title';

vi.mock('@/infra/contexts/theme-provider', () => ({
  useThemeContext: vi.fn(),
}));

vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return {
    ...mod,
    useTranslation: () => ({
      t: (key: string) => (key === 'widgetHeader.menu.renameWidget' ? 'Rename Widget' : key),
    }),
  };
});

(useThemeContext as Mock).mockReturnValue({
  themeSettings: {
    widget: { header: { titleTextColor: '#5B6372', titleFontSize: 15, titleAlignment: 'Left' } },
    typography: { fontFamily: '"Open Sans",sans-serif' },
  },
});

const renderTitleHook = (
  headerConfig?: WidgetHeaderConfig,
  params: UseWidgetHeaderTitleParams = {},
) => renderHook(() => useWidgetHeaderTitle(headerConfig, params));

/** The title item the hook contributed to `config.items`. */
const titleItemOf = (headerConfig: WidgetHeaderConfig): HeaderItem | undefined =>
  (headerConfig.items as HeaderItem[] | undefined)?.find(
    (item) => item.id === WidgetHeaderTargets.Title,
  );

/**
 * Renders the contributed title item the way the header's item cell would. Queries are scoped to this
 * render's own container: a test may render the item more than once (before and after an edit), and
 * the earlier copies stay mounted until cleanup.
 */
const renderTitleItem = (headerConfig: WidgetHeaderConfig) => {
  const { container } = render(
    <>{titleItemOf(headerConfig)?.component({ size: { width: 28, height: 28 } })}</>,
  );
  return { container, input: () => container.querySelector('input') };
};

const clickRename = (headerConfig: WidgetHeaderConfig) =>
  findMenuActionByPath(
    headerConfig?.menu?.items,
    WidgetHeaderMenuTargets.RenameWidget,
  )?.onClick?.();

describe('useWidgetHeaderTitle', () => {
  it('contributes an item claiming the title slot', () => {
    const { result } = renderTitleHook(undefined, { title: 'My Widget' });

    expect(titleItemOf(result.current)).toBeDefined();
    expect(renderTitleItem(result.current).container).toHaveTextContent('My Widget');
  });

  it('adds no rename entry when title.editing.enabled is not set', () => {
    const { result } = renderTitleHook({ menu: { items: [] } });

    expect(result.current.menu?.items?.length).toBe(0);
  });

  it('adds the rename menu entry when title.editing.enabled is true', () => {
    const { result } = renderTitleHook({ title: { editing: { enabled: true } } });

    expect(
      findMenuActionByPath(result.current.menu?.items, WidgetHeaderMenuTargets.RenameWidget),
    ).toMatchObject({
      type: 'action',
      id: WidgetHeaderMenuTargets.RenameWidget,
      caption: 'Rename Widget',
    });
  });

  it('puts the title item into edit mode when the rename entry is clicked', () => {
    const { result } = renderTitleHook(
      { title: { editing: { enabled: true } } },
      { title: 'My widget' },
    );
    expect(renderTitleItem(result.current).input()).toBeNull();

    act(() => clickRename(result.current));

    // The editor's wiring never leaves the hook, so this is the only way to observe it: the
    // contributed item now renders an input.
    expect(renderTitleItem(result.current).input()).toHaveValue('My widget');
  });

  it('fires onChange with title/changed when the edited title is committed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { result } = renderTitleHook(
      { title: { editing: { enabled: true } } },
      { title: 'Original', onChange },
    );
    act(() => clickRename(result.current));

    const input = renderTitleItem(result.current).input() as HTMLInputElement;
    await user.clear(input);
    await user.type(input, 'New Title');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'New Title' },
    });
  });

  it('leaves edit mode on Escape without reporting a change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { result } = renderTitleHook(
      { title: { editing: { enabled: true } } },
      { title: 'Original', onChange },
    );
    act(() => clickRename(result.current));

    await user.type(renderTitleItem(result.current).input() as HTMLInputElement, 'Discarded');
    await user.keyboard('{Escape}');

    expect(onChange).not.toHaveBeenCalled();
    expect(renderTitleItem(result.current).input()).toBeNull();
  });

  it('keeps existing menu items, with the built-in rename entry first', () => {
    const existingItem = {
      type: 'action' as const,
      id: 'custom-item',
      caption: 'Custom',
      onClick: vi.fn(),
    };
    const { result } = renderTitleHook({
      title: { editing: { enabled: true } },
      menu: { items: [existingItem] },
    });

    expect(result.current.menu?.items?.map((item) => item.id)).toEqual([
      WidgetHeaderMenuTargets.RenameWidget,
      'custom-item',
    ]);
  });

  it('keeps the rest of the header config untouched', () => {
    const onBeforeRender = vi.fn((items) => [...items]);
    const { result } = renderTitleHook({ onBeforeRender, items: [] });

    expect(result.current.onBeforeRender).toBe(onBeforeRender);
  });
});
