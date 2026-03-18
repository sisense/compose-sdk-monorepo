import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { WidgetChangeEvent } from '@/domains/widgets/change-events.js';
import type { TitleEditorConfig } from '@/domains/widgets/shared/widget-header/types.js';
import type { MenuItem } from '@/shared/types/menu-item.js';

/** Parameters for the title renaming hook. */
export type UseTitleRenamingParams = {
  /** Whether inline title renaming is enabled. */
  enabled: boolean;
  /** Handler called when the user commits a new title. */
  onChange?: (event: WidgetChangeEvent) => void;
};

/** Result of the title renaming hook. */
export type UseTitleRenamingResult = {
  /** "Rename" menu item to inject into the header toolbar; undefined when not enabled. */
  renameMenuItem: MenuItem | undefined;
  /** Config for the inline title editor; undefined when not enabled. */
  titleEditorConfig: TitleEditorConfig | undefined;
};

/**
 * Hook that manages inline title renaming state: isEditing, start/cancel/commit
 * callbacks, titleEditorConfig for the title editor, and a prepared "Rename" menu item.
 * Emits title/changed on commit.
 *
 * @param params - Hook parameters
 * @returns renameMenuItem and titleEditorConfig
 * @internal
 */
export function useTitleRenaming(params: UseTitleRenamingParams): UseTitleRenamingResult {
  const { enabled, onChange } = params;
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const startRename = useCallback(() => {
    setIsEditing(true);
  }, []);

  const cancelRename = useCallback(() => {
    setIsEditing(false);
  }, []);

  const commitRename = useCallback(
    (newTitle: string) => {
      setIsEditing(false);
      onChange?.({
        type: 'title/changed',
        payload: { title: newTitle },
      });
    },
    [onChange],
  );

  const renameMenuItem = useMemo((): MenuItem | undefined => {
    if (!enabled) return undefined;
    return {
      id: 'rename-widget',
      caption: t('widgetHeader.menu.renameWidget'),
      onClick: startRename,
    };
  }, [enabled, t, startRename]);

  const titleEditorConfig = useMemo((): TitleEditorConfig | undefined => {
    if (!enabled) return undefined;
    return {
      isEditing,
      onCommit: commitRename,
      onCancel: cancelRename,
      onEditingChange: (editing: boolean) => {
        if (editing) {
          startRename();
        } else {
          cancelRename();
        }
      },
    };
  }, [enabled, isEditing, commitRename, cancelRename, startRename]);

  return {
    renameMenuItem,
    titleEditorConfig,
  };
}
