export type GroupedItemsBrowserProps = {
  groupedItems: ItemsGroup[];
  groupSecondaryActionConfig?: GroupSecondaryActionConfig;
  itemActionConfig?: ItemActionConfig;
  itemSecondaryActionConfig?: ItemSecondaryActionConfig;
  onScrolledToBottom?: () => void;
  collapseAll?: boolean;
};

/**
 * A group of items.
 */
export type ItemsGroup = {
  title: string;
  id: string;
  items: Item[];
  Icon?: React.ComponentType;
  description?: string;
};

/**
 * An item in the list of grouped items.
 */
export type Item = {
  id: string;
  title: string;
  Icon?: React.ComponentType;
  isDisabled?: boolean;
  hoverTooltip?: string;
  description?: string;
};

export type GroupSecondaryActionConfig = {
  SecondaryActionButtonIcon: React.ComponentType<{
    group: ItemsGroup;
  }>;
  onClick(this: void, group: ItemsGroup): void;
};

export type ItemActionConfig = {
  onClick(this: void, item: Item): void;
  getLabel?: (this: void, item: Item) => string;
};

export type ItemSecondaryActionConfig = {
  SecondaryActionButtonIcon: React.ComponentType<{ item: Item }>;
  /**
   * When true, the row keeps hover/focus style after the secondary action is clicked (e.g. while a menu is open).
   * The row is cleared when the consumer calls the `onSubmit` callback passed to `onClick`.
   */
  keepFocusedOnClick?: boolean;
  onClick(this: void, item: Item, event: React.MouseEvent, onSubmit: () => void): void;
};
