import { Attribute, DateDimension, Dimension } from '@sisense/sdk-data';

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
  attributeActionConfig: AttributeActionConfig;
  /**
   * Config for secondary action to be performed on an attribute.
   */
  attributeSecondaryActionConfig: AttributeSecondaryActionConfig;
  /**
   * Config for secondary action to be performed on a dimension.
   */
  dimensionSecondaryActionConfig: DimensionSecondaryActionConfig;
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
