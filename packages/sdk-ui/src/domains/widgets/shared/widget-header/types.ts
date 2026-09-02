export type {
  WidgetHeaderConfig,
  WidgetHeaderItem,
  WidgetHeaderItemComponent,
  WidgetHeaderItemComponentProps,
  WidgetHeaderItemPosition,
  WidgetHeaderItemSize,
  WidgetHeaderItemsTransform,
  WidgetHeaderMenuConfig,
  WidgetHeaderMenuItem,
  WidgetHeaderTitleConfig,
  WidgetResolvedHeaderItem,
} from './widget-header-config.js';
export { WidgetHeaderTargets, type WidgetHeaderTarget } from './widget-header-targets.js';

/**
 * Configuration for inline title editing (e.g. rename widget).
 */
export type TitleEditorConfig = {
  /** Whether the title is currently being edited */
  isEditing: boolean;
  /** Called when the user commits the new title (blur / Enter) */
  onCommit: (newTitle: string) => void;
  /** Called when the user cancels editing (Escape) */
  onCancel: () => void;
  /** Called to request entering/leaving edit mode */
  onEditingChange: (editing: boolean) => void;
};
