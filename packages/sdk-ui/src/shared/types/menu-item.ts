/**
 * Menu item
 */
export type MenuItem = {
  /**
   * Unique identifier for the menu item
   */
  id: string;
  /**
   * Caption of the menu item
   */
  caption: string;
  /**
   * Handler function to be called when the menu item is clicked
   */
  onClick: () => void;
};
