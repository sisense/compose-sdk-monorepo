import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { WidgetTitleChangedEvent } from '@/domains/widgets/change-events.js';
import type { TitleEditorConfig } from '@/domains/widgets/shared/widget-header/types.js';
import { WidgetHeaderMenuTargets } from '@/domains/widgets/shared/widget-header/widget-header-menu-targets.js';
import type { MenuActionItem } from '@/shared/types/menu-item.js';

/** Parameters for the title renaming hook. */
export type UseTitleRenamingParams = {
  /** Whether inline title renaming is enabled. */
  enabled: boolean;
  /** Handler called when the user commits a new title. */
  onChange?: (event: WidgetTitleChangedEvent) => void;
};

/** Result of the title renaming hook. */
export type UseTitleRenamingResult = {
  /** "Rename" menu item to inject into the header menu; undefined when not enabled. */
  renameMenuItem: MenuActionItem | undefined;
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

  const renameMenuItem = useMemo((): MenuActionItem | undefined => {
    if (!enabled) return undefined;
    return {
      type: 'action',
      id: WidgetHeaderMenuTargets.RenameWidget,
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
