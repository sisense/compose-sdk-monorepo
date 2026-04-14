import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import {
  Attribute,
  BaseMeasure,
  createMeasureByAggType,
  DataSource,
  Dimension,
  DimensionalAttribute,
  DimensionalDateDimension,
  isDimensionalAttribute,
  isDimensionalDateDimension,
} from '@sisense/sdk-data';
import groupBy from 'lodash-es/groupBy';

import { useGetDimensionsFromDataSourceFields } from '@/domains/data-browser/add-filter-popover/add-filter-data-browser';
import { useGetDataSourceFields } from '@/domains/data-browser/data-source-dimensional-model/hooks/use-get-data-source-fields.js';
import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import { withLazyLoading } from '@/shared/hooks/decorators/with-lazy-loading/index.js';
import { MenuItemSection } from '@/types';

import { DimensionsBrowserContainer } from '../data-schema-browser/data-schema-browser.styles.js';
import { DataSourceSelector } from '../data-source-selector/data-source-selector.js';
import { useDataSourceSelection } from '../data-source-selector/use-data-source-selection.js';
import { DimensionsBrowser } from '../dimensions-browser/dimensions-browser.js';
import { AttributiveElement } from '../dimensions-browser/types.js';
import { SearchInput } from '../search-input/search-input.js';
import './add-measure-popover.scss';
import { getMeasuresListForAttribute } from './measures.js';

type AddMeasureDataBrowserProps = {
  dataSources: DataSource[];
  initialDataSource: DataSource;
  onMeasureCreated: (measure: BaseMeasure) => void;
};

/**
 * A custom hook that fetches data source fields with lazy loading.
 * It uses the `withLazyLoading` decorator to handle pagination and loading state.
 */
const useInfiniteGetDataSourceFields = withLazyLoading({
  initialCount: 50,
  chunkSize: 50,
  dataKey: 'dataSourceFields',
})(useGetDataSourceFields);

type MeasureItem = {
  create: () => BaseMeasure;
  title: string;
  class: string;
  group: string;
};

const MoreButton = styled.span<Themable>`
  margin-left: 8px;
  color: ${({ theme }) => theme.dashboard.toolbar.secondaryTextColor};
  font-size: 13px;
  line-height: 24px;
`;

const useMeasuresMap = (dimensions: Dimension[]) => {
  const { t } = useTranslation();

  return useMemo(() => {
    const getAttributeMeasures = (attribute: DimensionalAttribute): MeasureItem[] => {
      return getMeasuresListForAttribute(attribute).map((measureConfig) => ({
        title: t(measureConfig.titleKey),
        class: measureConfig.class,
        group: measureConfig.group,
        create: () => createMeasureByAggType(measureConfig.name, attribute),
      }));
    };

    const getDimensionMeasures = (dimension: DimensionalDateDimension): MeasureItem[] => {
      const attributes = [
        dimension.Years,
        dimension.Quarters,
        dimension.Months,
        dimension.Weeks,
        dimension.Days,
      ];

      return attributes.flatMap((attribute) => {
        return getMeasuresListForAttribute(attribute).map((measureConfig) => ({
          title: t('measures.countShort', { level: attribute.name }),
          class: measureConfig.class,
          group: measureConfig.group,
          create: () => createMeasureByAggType(measureConfig.name, attribute),
        }));
      });
    };

    const dimensionMeasureItems: Array<[Dimension, MeasureItem[]]> = dimensions
      .flatMap((dimension) => dimension.dimensions)
      .filter(isDimensionalDateDimension)
      .map((dimension) => [dimension, getDimensionMeasures(dimension)]);

    const attributeMeasureItems: Array<[Attribute, MeasureItem[]]> = dimensions
      .flatMap((dimension) => dimension.attributes)
      .filter(isDimensionalAttribute)
      .map((attribute) => [attribute, getAttributeMeasures(attribute)]);

    return new Map<Attribute | Dimension, MeasureItem[]>(
      attributeMeasureItems.concat(dimensionMeasureItems),
    );
  }, [dimensions, t]);
};

/**
 * A component that allows users to select a data source and an attribute to create a measure.
 */
export const AddMeasureDataBrowser = ({
  initialDataSource,
  dataSources,
  onMeasureCreated,
}: AddMeasureDataBrowserProps) => {
  const { themeSettings } = useThemeContext();
  const { openMenu } = useMenu();
  const { t } = useTranslation();

  const { selectedDataSource, selectDataSource } = useDataSourceSelection(initialDataSource);
  const [searchValue, setSearchValue] = useState<string>('');

  const { dataSourceFields, isLoading, loadMore } = useInfiniteGetDataSourceFields({
    dataSource: selectedDataSource,
    searchValue,
  });

  const dimensions = useGetDimensionsFromDataSourceFields(dataSourceFields, selectedDataSource);

  const measuresByAttribute = useMeasuresMap(dimensions);

  const attributeActionConfig = useMemo(
    () => ({
      onClick: (attribute: AttributiveElement) => {
        const measure = measuresByAttribute.get(attribute)?.[0]?.create();
        if (measure) {
          onMeasureCreated(measure);
        }
      },
      getLabel: (attribute: AttributiveElement) =>
        measuresByAttribute.get(attribute)?.[0]?.title ?? '',
    }),
    [onMeasureCreated, measuresByAttribute],
  );

  const attributeSecondaryActionConfig = useMemo(
    () => ({
      SecondaryActionButtonIcon: () => (
        <MoreButton theme={themeSettings}>{t('dataBrowser.more')}</MoreButton>
      ),
      keepFocusedOnClick: true,
      onClick: (attribute: AttributiveElement, event: React.MouseEvent, onSubmit: () => void) => {
        const menuItems = Object.values(
          groupBy(measuresByAttribute.get(attribute) ?? [], ({ group }) => group),
        ).map<MenuItemSection>((measures) => {
          return {
            items: measures.map((item, index) => ({
              caption: item.title,
              class: item.class,
              onClick: () => onMeasureCreated(item.create()),
              style:
                index === measures.length - 1
                  ? {
                      borderBottom: '1px solid lightgray',
                    }
                  : {},
            })),
          };
        });

        const rect = event.currentTarget.getBoundingClientRect();

        openMenu({
          position: {
            left: rect.right,
            top: rect.top,
          },
          alignment: {
            horizontal: 'left',
            vertical: 'top',
          },
          itemSections: menuItems,
          onClose: onSubmit,
        });
      },
    }),
    [themeSettings, t, measuresByAttribute, openMenu, onMeasureCreated],
  );

  return (
    <DimensionsBrowserContainer theme={themeSettings}>
      <DataSourceSelector
        dataSources={dataSources}
        selectedDataSource={selectedDataSource}
        onChange={selectDataSource}
      />
      <SearchInput onChange={setSearchValue} />
      <DimensionsBrowser
        dimensions={dimensions}
        attributeActionConfig={attributeActionConfig}
        attributeSecondaryActionConfig={attributeSecondaryActionConfig}
        onScrolledToBottom={loadMore}
        isLoading={isLoading}
      />
    </DimensionsBrowserContainer>
  );
};
