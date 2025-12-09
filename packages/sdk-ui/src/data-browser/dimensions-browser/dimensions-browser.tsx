import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Attribute, DateDimension, Dimension, MetadataTypes } from '@sisense/sdk-data';

import { GroupedItemsBrowser } from '@/common/components/grouped-items-browser/grouped-items-browser';
import {
  GroupedItemsBrowserProps,
  GroupSecondaryActionConfig,
  Item,
  ItemActionConfig,
  ItemSecondaryActionConfig,
  ItemsGroup,
} from '@/common/components/grouped-items-browser/types';
import { LoadingDots } from '@/common/components/loading-dots.js';
import { DateAttributeIcon } from '@/common/icons/date-attribute-icon.js';
import { NumericAttributeIcon } from '@/common/icons/numeric-attribute-icon.js';
import { TableIcon } from '@/common/icons/table-icon.js';
import { TextAttributeIcon } from '@/common/icons/text-attribute-icon.js';
import styled from '@/styled';
import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types.js';
import { TranslatableError } from '@/translation/translatable-error.js';

import {
  AttributeActionConfig,
  AttributeSecondaryActionConfig,
  AttributiveElement,
  DimensionsBrowserProps,
  DimensionSecondaryActionConfig,
} from './types.js';

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
  onScrolledToBottom,
  isLoading,
  disabledAttributesConfig,
  collapseAll,
}) => {
  const hasDimesions = dimensions.length > 0;
  const groupedItemsBrowserProps = useMemo(() => {
    return convertDimensionsBrowserProps({
      dimensions,
      attributeActionConfig,
      dimensionSecondaryActionConfig,
      attributeSecondaryActionConfig,
      onScrolledToBottom,
      disabledAttributesConfig,
      collapseAll,
    });
  }, [
    dimensions,
    attributeActionConfig,
    dimensionSecondaryActionConfig,
    attributeSecondaryActionConfig,
    onScrolledToBottom,
    disabledAttributesConfig,
    collapseAll,
  ]);
  return (
    <>
      {hasDimesions && <GroupedItemsBrowser {...groupedItemsBrowserProps} />}
      {!isLoading && !hasDimesions && <NoResults />}
      {isLoading && (
        <LoadingContainer>
          <LoadingDots />
        </LoadingContainer>
      )}
    </>
  );
};

const convertDimensionsBrowserProps = ({
  dimensions,
  attributeActionConfig,
  attributeSecondaryActionConfig,
  dimensionSecondaryActionConfig,
  onScrolledToBottom,
  disabledAttributesConfig,
  collapseAll,
}: DimensionsBrowserProps): GroupedItemsBrowserProps => {
  const findDimension = getDimensionFinder(dimensions);
  const findAttribute = getAttributeFinder(dimensions);

  return {
    groupedItems: convertDimensionsToGroupedItems(dimensions, disabledAttributesConfig),
    itemActionConfig:
      attributeActionConfig && convertAttributeActionConfig(attributeActionConfig, findAttribute),
    itemSecondaryActionConfig:
      attributeSecondaryActionConfig &&
      convertAttributeSecondaryActionConfig(attributeSecondaryActionConfig, findAttribute),
    groupSecondaryActionConfig:
      dimensionSecondaryActionConfig &&
      convertDimensionSecondaryActionConfig(dimensionSecondaryActionConfig, findDimension),
    onScrolledToBottom,
    collapseAll,
  };
};

function isDateDimension(dimension: Dimension): dimension is DateDimension {
  return dimension.type === MetadataTypes.DateDimension;
}

/**
 * If you creat a dimension with the only DateTimeDimensions inside - it will add dummy TextDimension to the attributes list
 * TODO: understand why we need this logic in `sdk-data`
 */
function isRealAttribute(attribute: Attribute | Dimension): attribute is Attribute {
  return MetadataTypes.isAttribute(attribute);
}

function convertDimensionsToGroupedItems(
  dimensions: Dimension[],
  disabledAttributesConfig?: DimensionsBrowserProps['disabledAttributesConfig'],
): ItemsGroup[] {
  return dimensions.map((dimension) => {
    const attributiveElements = getAttributiveElements(dimension);
    return {
      title: dimension.title,
      id: dimension.name,
      description: dimension.description,
      items: attributiveElements.map((attribute) => {
        const isDisabled = disabledAttributesConfig?.disabledAttributes.some(
          // on our default dashboards we have a case of filter attributes with table name in lowercase,
          // when officially they are not, so we need to compare them in a case insensitive way
          (disabledAttribute) =>
            attribute.id.toLocaleLowerCase() === disabledAttribute.id.toLocaleLowerCase(),
        );
        return {
          id: attribute.id,
          title: attribute.title,
          Icon: attributeIconMapping[attribute.type],
          isDisabled,
          hoverTooltip: isDisabled
            ? disabledAttributesConfig?.getTooltip?.(attribute)
            : attribute.description,
        };
      }),
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

function getAttributiveElements(dimension: Dimension): AttributiveElement[] {
  const pureAttributes = dimension.attributes.filter(isRealAttribute);
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
    dimensions.flatMap(getAttributiveElements).map((attribute) => [attribute.id, attribute]),
  );
  return (item) => {
    const attribute = attributeMap.get(item.id);
    if (!attribute) {
      throw new TranslatableError('errors.dataBrowser.attributeNotFound', { attributeId: item.id });
    }
    return attribute;
  };
}

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const NoResultsContainer = styled.div<Themable>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  display: flex;
  justify-content: center;
`;

const NoResults = () => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  return (
    <NoResultsContainer theme={themeSettings}>{t('dataBrowser.noResults')}</NoResultsContainer>
  );
};
