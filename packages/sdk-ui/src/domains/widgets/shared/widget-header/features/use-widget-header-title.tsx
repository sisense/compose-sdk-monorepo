import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import { asBuiltInHeaderItem } from '@/domains/shared/header';
import type { WidgetTitleChangedEvent } from '@/domains/widgets/change-events.js';
import { withHeaderItemsInConfig } from '@/domains/widgets/helpers/header-items-utils.js';
import { withMenuItemInHeaderConfig } from '@/domains/widgets/helpers/header-menu-utils.js';
import { useTitleRenaming } from '@/domains/widgets/hooks/use-title-renaming.js';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types.js';
import { InlineTextEditor } from '@/shared/components/inline-text-editor/inline-text-editor.js';
import { WidgetContainerStyleOptions } from '@/types';

import { TitleEditorConfig, WidgetHeaderConfig } from '../types.js';
import { WidgetHeaderTargets } from '../widget-header-targets.js';

type WidgetHeaderTitleStyleOptions = WidgetContainerStyleOptions['header'];

type WidgetHeaderTitleStyleable = {
  styleOptions?: WidgetHeaderTitleStyleOptions;
};

const StyledWidgetHeaderTitle = styled.div<WidgetHeaderTitleStyleable & Themable>`
  /* The title takes its content width; where it sits in the row is decided by the two spacers around
     it (see resolveTitleAlignmentFills), not by text-align. min-width:0 lets it shrink within its
     cell so a long title ellipsizes instead of pushing the action items out of the header. */
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ styleOptions, theme }) =>
    styleOptions?.titleTextColor || theme.widget.header.titleTextColor};
  font-family: ${({ theme }) => theme.typography?.fontFamily ?? 'inherit'};
  font-size: ${({ theme }) => {
    const size = theme.widget.header.titleFontSize;
    return typeof size === 'number' ? `${size}px` : size;
  }};
`;

/**
 * Params for {@link useWidgetHeaderTitle}.
 */
export interface UseWidgetHeaderTitleParams {
  /** The widget title text. */
  title?: string;
  /** Style options for the widget header. */
  styleOptions?: WidgetHeaderTitleStyleOptions;
  /** Reports a committed rename as a `title/changed` event. */
  onChange?: (event: WidgetTitleChangedEvent) => void;
}

/**
 * Props for {@link WidgetHeaderTitle}.
 */
interface WidgetHeaderTitleProps {
  /** The widget title text. */
  title?: string;
  /** Style options for the widget header. */
  styleOptions?: WidgetHeaderTitleStyleOptions;
  /** Inline title editor config (provided at runtime when renaming is enabled). */
  titleEditor?: TitleEditorConfig;
}

/**
 * Renders the widget title as the content of the built-in title header item.
 *
 * Renders the title through the inline editor when renaming is enabled.
 */
export const WidgetHeaderTitle = ({ title, styleOptions, titleEditor }: WidgetHeaderTitleProps) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();

  return (
    <StyledWidgetHeaderTitle
      styleOptions={styleOptions}
      theme={themeSettings}
      data-component="title"
    >
      {titleEditor ? (
        <InlineTextEditor
          value={title ?? ''}
          isEditing={titleEditor.isEditing}
          onEditingChange={titleEditor.onEditingChange}
          onCommit={titleEditor.onCommit}
          onCancel={titleEditor.onCancel}
          placeholder={t('widgetHeader.addTitle')}
        />
      ) : (
        title
      )}
    </StyledWidgetHeaderTitle>
  );
};

/**
 * Adds a widget's title to its header, renamable in place when `config.header.title.editing` is on.
 *
 * Everything it produces travels through the header's own interfaces: the title arrives as a regular
 * (marked) entry of `config.header.items`, and renaming adds its "Rename widget" entry through the
 * menu config. The inline editor's wiring stays inside — the widget component never sees it, so there
 * is nothing to thread through `WidgetContainer`.
 *
 * A widget with no title (a text widget) simply doesn't call this. Where the title sits in the row,
 * and that it is the item which shrinks under pressure, are the header's business: the slot supplies
 * `fill`.
 *
 * @param headerConfig - The widget's header config so far.
 * @param params - The title text, header style options and the change handler renaming reports to.
 * @returns The header config carrying the title item and, when renaming is on, the rename menu entry.
 * @internal
 */
export const useWidgetHeaderTitle = (
  headerConfig: WidgetHeaderConfig | undefined,
  { title, styleOptions, onChange }: UseWidgetHeaderTitleParams,
): WidgetHeaderConfig => {
  const renameEnabled = headerConfig?.title?.editing?.enabled ?? false;

  const { renameMenuItem, titleEditorConfig } = useTitleRenaming({
    enabled: renameEnabled,
    onChange,
  });

  const titleItem = useMemo(
    () =>
      asBuiltInHeaderItem({
        id: WidgetHeaderTargets.Title,
        component: () => (
          <WidgetHeaderTitle
            title={title}
            styleOptions={styleOptions}
            titleEditor={titleEditorConfig}
          />
        ),
      }),
    [title, styleOptions, titleEditorConfig],
  );

  return useMemo(() => {
    const withRenameEntry =
      renameEnabled && renameMenuItem
        ? withMenuItemInHeaderConfig(renameMenuItem)(headerConfig ?? {})
        : headerConfig ?? {};
    return withHeaderItemsInConfig([titleItem])(withRenameEntry);
  }, [renameEnabled, renameMenuItem, headerConfig, titleItem]);
};
