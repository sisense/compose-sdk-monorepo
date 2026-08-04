import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WidgetHeaderConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { WidgetHeaderMenuTargets } from '@/domains/widgets/shared/widget-header/widget-header-menu-targets.js';
import { findMenuActionByPath } from '@/shared/types/__test-helpers__/find-menu-item.js';

import {
  useWidgetHeaderManagement,
  type UseWidgetHeaderManagementParams,
} from './use-widget-header-management.js';

vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return {
    ...mod,
    useTranslation: () => ({
      t: (key: string) => (key === 'widgetHeader.menu.renameWidget' ? 'Rename Widget' : key),
    }),
  };
});

function getRenameMenuItemOnClick(headerConfig: WidgetHeaderConfig): (() => void) | undefined {
  return findMenuActionByPath(headerConfig?.menu?.items, WidgetHeaderMenuTargets.RenameWidget)
    ?.onClick;
}

function getTitleEditorFromResult(result: {
  titleEditor?: {
    isEditing?: boolean;
    onCommit?: (t: string) => void;
    onCancel?: () => void;
    onEditingChange?: (e: boolean) => void;
  };
}) {
  return result.titleEditor;
}

describe('useWidgetHeaderManagement', () => {
  it('returns headerConfig without rename UI when title.editing.enabled is not set', () => {
    const existingHeader: WidgetHeaderConfig = { menu: { items: [] } };
    const params: UseWidgetHeaderManagementParams = {
      headerConfig: existingHeader,
    };

    const { result } = renderHook(() => useWidgetHeaderManagement(params));

    expect(result.current.headerConfig).toBe(existingHeader);
    expect(result.current.titleEditor).toBeUndefined();
    expect(result.current.headerConfig?.menu?.items?.length).toBe(0);
  });

  it('returns merged headerConfig with rename menu item and titleEditor when title.editing.enabled is true', () => {
    const params: UseWidgetHeaderManagementParams = {
      title: 'My Widget',
      headerConfig: { title: { editing: { enabled: true } } },
    };

    const { result } = renderHook(() => useWidgetHeaderManagement(params));

    const menuItems = result.current.headerConfig?.menu?.items ?? [];
    const renameItem = findMenuActionByPath(menuItems, WidgetHeaderMenuTargets.RenameWidget);
    expect(renameItem).toBeDefined();
    expect(renameItem).toMatchObject({
      type: 'action',
      id: WidgetHeaderMenuTargets.RenameWidget,
      caption: 'Rename Widget',
    });
    expect(typeof renameItem?.onClick).toBe('function');

    const titleEditor = getTitleEditorFromResult(result.current);
    expect(titleEditor).toBeDefined();
    expect(titleEditor).toHaveProperty('isEditing');
    expect(titleEditor).toHaveProperty('onCommit');
    expect(titleEditor).toHaveProperty('onCancel');
    expect(titleEditor).toHaveProperty('onEditingChange');
  });

  it('menu click enters edit mode (sets isEditing true)', () => {
    const params: UseWidgetHeaderManagementParams = {
      title: 'My widget',
      headerConfig: { title: { editing: { enabled: true } } },
    };

    const { result } = renderHook(() => useWidgetHeaderManagement(params));
    expect(getTitleEditorFromResult(result.current)?.isEditing).toBe(false);

    act(() => {
      getRenameMenuItemOnClick(result.current.headerConfig)?.();
    });

    expect(getTitleEditorFromResult(result.current)?.isEditing).toBe(true);
  });

  it('onCommit fires onChange with title/changed', () => {
    const onChange = vi.fn();
    const params: UseWidgetHeaderManagementParams = {
      title: 'Original',
      headerConfig: { title: { editing: { enabled: true } } },
      onChange,
    };

    const { result } = renderHook(() => useWidgetHeaderManagement(params));

    act(() => {
      getRenameMenuItemOnClick(result.current.headerConfig)?.();
    });

    const titleEditor = getTitleEditorFromResult(result.current);
    expect(titleEditor).toBeDefined();
    act(() => {
      titleEditor?.onCommit?.('New Title');
    });

    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'New Title' },
    });
  });

  it('onCancel exits edit mode', () => {
    const params: UseWidgetHeaderManagementParams = {
      headerConfig: { title: { editing: { enabled: true } } },
    };

    const { result } = renderHook(() => useWidgetHeaderManagement(params));

    act(() => {
      getRenameMenuItemOnClick(result.current.headerConfig)?.();
    });
    const titleEditorCancel = getTitleEditorFromResult(result.current);
    expect(titleEditorCancel?.isEditing).toBe(true);

    act(() => {
      titleEditorCancel?.onCancel?.();
    });
    expect(getTitleEditorFromResult(result.current)?.isEditing).toBe(false);
  });

  it('onEditingChange(true) enters edit mode (double-click flow)', () => {
    const params: UseWidgetHeaderManagementParams = {
      headerConfig: { title: { editing: { enabled: true } } },
    };

    const { result } = renderHook(() => useWidgetHeaderManagement(params));
    const titleEditorEdit = getTitleEditorFromResult(result.current);
    expect(titleEditorEdit?.isEditing).toBe(false);

    act(() => {
      titleEditorEdit?.onEditingChange?.(true);
    });
    expect(getTitleEditorFromResult(result.current)?.isEditing).toBe(true);
  });

  it('merges with existing headerConfig menu items, keeping the built-in rename item first', () => {
    const existingItem = {
      type: 'action' as const,
      id: 'custom-item',
      caption: 'Custom',
      onClick: vi.fn(),
    };
    const existingHeader: WidgetHeaderConfig = {
      title: { editing: { enabled: true } },
      menu: { items: [existingItem] },
    };
    const params: UseWidgetHeaderManagementParams = {
      headerConfig: existingHeader,
    };

    const { result } = renderHook(() => useWidgetHeaderManagement(params));

    const items = result.current.headerConfig?.menu?.items ?? [];
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      type: 'action',
      id: WidgetHeaderMenuTargets.RenameWidget,
      caption: 'Rename Widget',
    });
    expect(items[1]).toEqual(existingItem);
  });

  it('enables rename when headerConfig has title.editing.enabled true', () => {
    const params: UseWidgetHeaderManagementParams = {
      headerConfig: { title: { editing: { enabled: true } } },
    };

    const { result } = renderHook(() => useWidgetHeaderManagement(params));

    expect(getTitleEditorFromResult(result.current)).toBeDefined();
    const menuItems = result.current.headerConfig?.menu?.items ?? [];
    expect(
      menuItems.some((item: { id?: string }) => item.id === WidgetHeaderMenuTargets.RenameWidget),
    ).toBe(true);
  });
});
