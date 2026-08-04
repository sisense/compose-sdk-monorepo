export type {
  WidgetHeaderConfig,
  WidgetHeaderMenuConfig,
  WidgetHeaderMenuItem,
  WidgetHeaderTitleConfig,
} from './widget-header-config.js';

/**
 * Config for the info button (data passed into the header/toolbar API)
 */
export type InfoButtonConfig = {
  dataSetName?: string;
  description?: string;
  errorMessages?: string[];
  warningMessages?: string[];
};

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
