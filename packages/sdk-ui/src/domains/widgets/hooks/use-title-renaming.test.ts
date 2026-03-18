import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useTitleRenaming, type UseTitleRenamingParams } from './use-title-renaming.js';

vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return {
    ...mod,
    useTranslation: () => ({
      t: (key: string) => (key === 'widgetHeader.menu.renameWidget' ? 'Rename Widget' : key),
    }),
  };
});

describe('useTitleRenaming', () => {
  it('returns undefined renameMenuItem and titleEditorConfig when enabled is false', () => {
    const params: UseTitleRenamingParams = { enabled: false };
    const { result } = renderHook(() => useTitleRenaming(params));

    expect(result.current.renameMenuItem).toBeUndefined();
    expect(result.current.titleEditorConfig).toBeUndefined();
  });

  it('returns renameMenuItem and titleEditorConfig when enabled is true', () => {
    const params: UseTitleRenamingParams = { enabled: true };
    const { result } = renderHook(() => useTitleRenaming(params));

    const menuItem = result.current.renameMenuItem;
    expect(menuItem).toBeDefined();
    expect(menuItem).toMatchObject({
      id: 'rename-widget',
      caption: 'Rename Widget',
    });
    expect(typeof menuItem?.onClick).toBe('function');

    const config = result.current.titleEditorConfig;
    expect(config).toBeDefined();
    expect(config).toHaveProperty('isEditing', false);
    expect(config).toHaveProperty('onCommit');
    expect(config).toHaveProperty('onCancel');
    expect(config).toHaveProperty('onEditingChange');
  });

  it('renameMenuItem onClick sets isEditing to true', () => {
    const params: UseTitleRenamingParams = { enabled: true };
    const { result } = renderHook(() => useTitleRenaming(params));

    expect(result.current.titleEditorConfig?.isEditing).toBe(false);

    act(() => {
      result.current.renameMenuItem?.onClick?.();
    });

    expect(result.current.titleEditorConfig?.isEditing).toBe(true);
  });

  it('onCancel exits edit mode', () => {
    const params: UseTitleRenamingParams = { enabled: true };
    const { result } = renderHook(() => useTitleRenaming(params));

    act(() => {
      result.current.renameMenuItem?.onClick?.();
    });
    expect(result.current.titleEditorConfig?.isEditing).toBe(true);

    act(() => {
      result.current.titleEditorConfig?.onCancel?.();
    });
    expect(result.current.titleEditorConfig?.isEditing).toBe(false);
  });

  it('onCommit fires onChange with title/changed and exits edit mode', () => {
    const onChange = vi.fn();
    const params: UseTitleRenamingParams = { enabled: true, onChange };
    const { result } = renderHook(() => useTitleRenaming(params));

    act(() => {
      result.current.renameMenuItem?.onClick?.();
    });

    act(() => {
      result.current.titleEditorConfig?.onCommit?.('New Title');
    });

    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'New Title' },
    });
    expect(result.current.titleEditorConfig?.isEditing).toBe(false);
  });

  it('onEditingChange(true) enters edit mode', () => {
    const params: UseTitleRenamingParams = { enabled: true };
    const { result } = renderHook(() => useTitleRenaming(params));

    expect(result.current.titleEditorConfig?.isEditing).toBe(false);

    act(() => {
      result.current.titleEditorConfig?.onEditingChange?.(true);
    });

    expect(result.current.titleEditorConfig?.isEditing).toBe(true);
  });

  it('onEditingChange(false) exits edit mode', () => {
    const params: UseTitleRenamingParams = { enabled: true };
    const { result } = renderHook(() => useTitleRenaming(params));

    act(() => {
      result.current.renameMenuItem?.onClick?.();
    });
    expect(result.current.titleEditorConfig?.isEditing).toBe(true);

    act(() => {
      result.current.titleEditorConfig?.onEditingChange?.(false);
    });

    expect(result.current.titleEditorConfig?.isEditing).toBe(false);
  });
});
