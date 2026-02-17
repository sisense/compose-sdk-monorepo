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
 * Configuration options for the widget header
 */
export type WidgetHeaderConfig = {
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

/**
 * Menu item in the toolbar
 */
export type MenuItem = {
  /**
   * Unique identifier for the menu item
   */
  id: string;
  /**
   * Handler function to be called when the menu item is clicked
   */
  onClick: () => void;
  /**
   * Caption of the menu item
   */
  caption: string;
};
