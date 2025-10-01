import { Attribute, DateDimension, Dimension } from '@ethings-os/sdk-data';

/**
 * Properties for the `DimensionsBrowser` component.
 */
export type DimensionsBrowserProps = {
  /**
   * List of dimensions to be displayed.
   */
  dimensions: Dimension[];
  /**
   * Action to be performed when an attribute is clicked.
   */
  attributeActionConfig?: AttributeActionConfig;
  /**
   * Config for secondary action to be performed on an attribute.
   */
  attributeSecondaryActionConfig?: AttributeSecondaryActionConfig;
  /**
   * Config for secondary action to be performed on a dimension.
   */
  dimensionSecondaryActionConfig?: DimensionSecondaryActionConfig;

  /**
   * Callback to be executed when the user scrolls to the bottom of the list.
   */
  onScrolledToBottom?: () => void;

  /**
   * Flag indicating whether the component is in a loading state.
   * If `true`, a loading spinner will be displayed.
   */
  isLoading?: boolean;

  /**
   * Config for attributes disabling.
   * If provided, the specified attributes will be disabled and a tooltip will be shown on hover.
   */
  disabledAttributesConfig?: {
    disabledAttributes: AttributiveElement[];
    getTooltip: (attribute: AttributiveElement) => string;
  };

  /**
   * Whether to collapse all dimensions by default.
   * @internal
   */
  collapseAll?: boolean;
};

/**
 * Attribute-like element.
 * In the context of the `DimensionsBrowser`, both `Attribute` and inner `DateDimension`
 * of the parent `Dimension` mean the same level of item.
 */
export type AttributiveElement = Attribute | DateDimension;

/**
 * Config for an action to be performed when an attribute is clicked.
 */
export type AttributeActionConfig = {
  onClick(this: void, attribute: AttributiveElement): void;
};

/**
 * Config for secondary action to be performed on an attribute.
 */
export type AttributeSecondaryActionConfig = {
  /**
   * Icon (or any UI component) to be displayed on the secondary action button.
   */
  SecondaryActionButtonIcon: React.ComponentType<{
    attribute: AttributiveElement;
  }>;
  /**
   * Callback to be executed when the secondary action button is clicked.
   */
  onClick(this: void, attribute: AttributiveElement): void;
};

/**
 * Config for secondary action to be performed on a dimension.
 */
export type DimensionSecondaryActionConfig = {
  /**
   * Icon (or any UI component) to be displayed on the secondary action button.
   */
  SecondaryActionButtonIcon: React.ComponentType<{
    dimension: Dimension;
  }>;
  /**
   * Callback to be executed when the secondary action button is clicked.
   */
  onClick(this: void, dimension: Dimension): void;
};
