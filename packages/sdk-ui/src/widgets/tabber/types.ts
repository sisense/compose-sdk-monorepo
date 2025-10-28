import { CustomWidgetProps } from '@/props';

/**
 * Configuration options that define style of the various elements of the tabbers buttons widget.
 *
 */
export type TabberButtonsWidgetStyleOptions = {
  /**
   * Color of the widget description text
   */
  descriptionColor?: string;

  /**
   * Background color of the selected tab
   */
  selectedBackgroundColor?: string;

  /**
   * Text color of the selected tab
   */
  selectedColor?: string;

  /**
   * Whether to display the widget description
   *
   * @defaultValue true
   */
  showDescription?: boolean;

  /**
   * Whether to show visual separators between tabs
   *
   * @defaultValue true
   */
  showSeparators?: boolean;

  /**
   * Corner radius style for tabs
   */
  tabCornerRadius?: 'small' | 'medium' | 'large' | 'none';

  /**
   * Horizontal alignment of tabs within the widget
   */
  tabsAlignment?: 'left' | 'center' | 'right';

  /**
   * Spacing interval between tabs
   */
  tabsInterval?: 'small' | 'medium' | 'large';

  /**
   * Size of the tabs
   */
  tabsSize?: 'small' | 'medium' | 'large';

  /**
   * Background color of unselected tabs
   */
  unselectedBackgroundColor?: string;

  /**
   * Text color of unselected tabs
   */
  unselectedColor?: string;
};

/**
 * Custom options for the tabber buttons widget
 */
export type TabberButtonsWidgetCustomOptions = {
  /**
   * Index of the currently active tab (zero-based)
   *
   * @defaultValue 0
   */
  activeTab?: number;

  /**
   * Array of tab names to display in the tabber buttons widget
   */
  tabNames: string[];

  /**
   * Callback function invoked when a tab is selected
   *
   * @param tab - Index of the selected tab
   * @internal
   */
  onTabSelected?: (tab: number) => void;
};

/**
 * Props for tabbers buttons widget in a dashboard.
 */
export interface TabberButtonsWidgetProps extends CustomWidgetProps {
  /**
   * Unique identifier for the widget
   */
  id: string;

  /**
   * Widget type identifier, always 'custom' for tabber widget
   */
  widgetType: 'custom';

  /**
   * Custom widget type identifier, always 'tabber-buttons' for tabber widget
   */
  customWidgetType: 'tabber-buttons';

  /**
   * Style configuration options for the tabber buttons widget
   */
  styleOptions?: TabberButtonsWidgetStyleOptions;

  /**
   * Data options configuration (empty object for tabber widget as it doesn't require data)
   */
  dataOptions: Record<string, never>;

  /**
   * Configuration for tabs including names and active tab index
   */
  customOptions: TabberButtonsWidgetCustomOptions;

  /**
   * Description text displayed in the widget
   */
  description?: string;
}
