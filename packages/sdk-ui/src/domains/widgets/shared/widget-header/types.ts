import { MenuItem } from '@/shared/types/menu-item';

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

/**
 * Configuration options for the widget title (e.g. editing enabled flag).
 */
export type WidgetHeaderTitleConfig = {
  /**
   * Configuration options for the widget title renaming
   */
  editing?: {
    /**
     * Whether the widget title editing is enabled
     */
    enabled?: boolean;
  };
};

/**
 * Configuration options for the widget header
 */
export type WidgetHeaderConfig = {
  /**
   * Configuration options for the widget title (e.g. editing enabled).
   */
  title?: WidgetHeaderTitleConfig;
  /**
   * Configuration options for the toolbar
   */
  toolbar?: ToolbarConfig;
};

/**
 * Configuration options for the toolbar
 */
export type ToolbarConfig = {
  /**
   * Configuration options for the toolbar menu
   */
  menu?: ToolbarMenuConfig;
};

/**
 * Configuration options for the toolbar menu
 */
export type ToolbarMenuConfig = {
  /**
   * Whether the toolbar menu is enabled
   * If not specified, menu icon will be rendered if there are any menu items available
   */
  enabled?: boolean;
  /**
   * List of menu items to be injected into the toolbar additional to the default ones
   */
  items?: MenuItem[];
};
