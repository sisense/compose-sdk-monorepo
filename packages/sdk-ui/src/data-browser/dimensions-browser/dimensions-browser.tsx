import { GroupedItemsBrowser } from '@/common/components/grouped-items-browser/grouped-items-browser';
import {
  GroupedItemsBrowserProps,
  GroupSecondaryActionConfig,
  Item,
  ItemActionConfig,
  ItemSecondaryActionConfig,
  ItemsGroup,
} from '@/common/components/grouped-items-browser/types';
import { Attribute, DateDimension, Dimension, MetadataTypes } from '@sisense/sdk-data';
import { useMemo } from 'react';
import { DateAttributeIcon } from '@/common/icons/date-attribute-icon.js';
import { NumericAttributeIcon } from '@/common/icons/numeric-attribute-icon.js';
import { TableIcon } from '@/common/icons/table-icon.js';
import { TextAttributeIcon } from '@/common/icons/text-attribute-icon.js';
import {
  AttributeActionConfig,
  AttributeSecondaryActionConfig,
  AttributiveElement,
  DimensionsBrowserProps,
  DimensionSecondaryActionConfig,
} from './types.js';
import { TranslatableError } from '@/translation/translatable-error.js';

const attributeIconMapping: { [key: string]: React.ComponentType | undefined } = {
  'text-attribute': TextAttributeIcon,
  'numeric-attribute': NumericAttributeIcon,
  datedimension: DateAttributeIcon,
};

/**
 * A component that displays a list of dimensions and their attributes.
 */
export const DimensionsBrowser: React.FC<DimensionsBrowserProps> = ({
  dimensions,
  attributeActionConfig,
  attributeSecondaryActionConfig,
  dimensionSecondaryActionConfig,
}) => {
  const groupedItemsBrowserProps = useMemo(() => {
    return convertDimensionsBrowserProps({
      dimensions,
      attributeActionConfig,
      dimensionSecondaryActionConfig,
      attributeSecondaryActionConfig,
    });
  }, [
    dimensions,
    attributeActionConfig,
    dimensionSecondaryActionConfig,
    attributeSecondaryActionConfig,
  ]);
  return <GroupedItemsBrowser {...groupedItemsBrowserProps} />;
};

const convertDimensionsBrowserProps = ({
  dimensions,
  attributeActionConfig,
  attributeSecondaryActionConfig,
  dimensionSecondaryActionConfig,
}: DimensionsBrowserProps): GroupedItemsBrowserProps => {
  const findDimension = getDimensionFinder(dimensions);
  const findAttribute = getAttributeFinder(dimensions);
  return {
    groupedItems: convertDimensionsToGroupedItems(dimensions),
    itemActionConfig: convertAttributeActionConfig(attributeActionConfig, findAttribute),
    itemSecondaryActionConfig: convertAttributeSecondaryActionConfig(
      attributeSecondaryActionConfig,
      findAttribute,
    ),
    groupSecondaryActionConfig: convertDimensionSecondaryActionConfig(
      dimensionSecondaryActionConfig,
      findDimension,
    ),
  };
};

function isDateDimension(dimension: Dimension): dimension is DateDimension {
  return dimension.type === MetadataTypes.DateDimension;
}

function convertDimensionsToGroupedItems(dimensions: Dimension[]): ItemsGroup[] {
  return dimensions.map((dimension) => {
    const attributishElements = getAttributishElements(dimension);
    return {
      title: dimension.name,
      id: dimension.name,
      items: attributishElements.map((attribute) => ({
        id: attribute.id,
        title: attribute.name,
        Icon: attributeIconMapping[attribute.type],
      })),
      Icon: TableIcon,
    };
  }, []);
}

function convertAttributeActionConfig(
  attributeActionConfig: AttributeActionConfig,
  findAttribute: (item: Item) => AttributiveElement,
): ItemActionConfig {
  return {
    onClick: (item) => {
      attributeActionConfig.onClick(findAttribute(item));
    },
  };
}

function convertAttributeSecondaryActionConfig(
  attributeSecondaryActionConfig: AttributeSecondaryActionConfig,
  findAttribute: (item: Item) => Attribute,
): ItemSecondaryActionConfig {
  return {
    SecondaryActionButtonIcon: ({ item }) => {
      return (
        <attributeSecondaryActionConfig.SecondaryActionButtonIcon attribute={findAttribute(item)} />
      );
    },
    onClick: (item) => {
      attributeSecondaryActionConfig.onClick(findAttribute(item));
    },
  };
}

function convertDimensionSecondaryActionConfig(
  dimensionSecondaryActionConfig: DimensionSecondaryActionConfig,
  findDimension: (group: ItemsGroup) => Dimension,
): GroupSecondaryActionConfig {
  return {
    SecondaryActionButtonIcon: ({ group }) => {
      return (
        <dimensionSecondaryActionConfig.SecondaryActionButtonIcon
          dimension={findDimension(group)}
        />
      );
    },
    onClick: (group) => {
      dimensionSecondaryActionConfig.onClick(findDimension(group));
    },
  };
}

function getAttributishElements(dimension: Dimension): AttributiveElement[] {
  const pureAttributes = dimension.attributes;
  const dateDimensions = dimension.dimensions.filter(isDateDimension);
  return [...pureAttributes, ...dateDimensions].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns a function that finds a dimension by its id.
 */
function getDimensionFinder(dimensions: Dimension[]): (group: ItemsGroup) => Dimension {
  const dimensionMap = new Map(dimensions.map((dimension) => [dimension.name, dimension]));
  return (group) => {
    const dimension = dimensionMap.get(group.id);
    if (!dimension) {
      throw new TranslatableError('errors.dataBrowser.dimensionNotFound', {
        dimensionId: group.id,
      });
    }
    return dimension;
  };
}

/**
 * Returns a function that finds an attribute by its id.
 */
function getAttributeFinder(dimensions: Dimension[]): (item: Item) => AttributiveElement {
  const attributeMap = new Map(
    dimensions.flatMap(getAttributishElements).map((attribute) => [attribute.id, attribute]),
  );
  return (item) => {
    const attribute = attributeMap.get(item.id);
    if (!attribute) {
      throw new TranslatableError('errors.dataBrowser.attributeNotFound', { attributeId: item.id });
    }
    return attribute;
  };
}
