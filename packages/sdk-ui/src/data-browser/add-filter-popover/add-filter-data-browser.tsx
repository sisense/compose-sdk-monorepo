import { withLazyLoading } from '@/common/hooks/decorators/with-lazy-loading';
import { useGetDataSourceFields } from '@/common/hooks/fusion-endpoints/use-get-data-source-fields';
import { useThemeContext } from '@/theme-provider';

import {
  DataSource,
  DataSourceField,
  Dimension,
  getDimensionsFromDataSourceFields,
} from '@sisense/sdk-data';
import { useMemo, useState } from 'react';
import { DataSourceSelector } from '../data-source-selector/data-source-selector.js';
import { useDataSourceSelection } from '../data-source-selector/use-data-source-selection.js';
import { DimensionsBrowser } from '../dimensions-browser/dimensions-browser.js';
import { AttributiveElement } from '../dimensions-browser/types.js';
import { SearchInput } from '../search-input/search-input.js';
import { DimensionsBrowserContainer } from '../data-schema-browser/data-schema-browser.styles.js';

type AddFilterDataBrowserProps = {
  dataSources: DataSource[];
  initialDataSource: DataSource;
  /**
   * Optional. If provided, the user will not be able to see these attributes in the data browser.
   */
  disabledAttributes?: AttributiveElement[];
  onAttributeClick: (attribute: AttributiveElement) => void;
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

/**
 * A component that allows users to select a data source and an attribute to create a filter.
 */
export const AddFilterDataBrowser = ({
  initialDataSource,
  dataSources,
  disabledAttributes,
  onAttributeClick,
}: AddFilterDataBrowserProps) => {
  const { themeSettings } = useThemeContext();

  const { selectedDataSource, selectDataSource } = useDataSourceSelection(initialDataSource);
  const [searchValue, setSearchValue] = useState<string>('');

  const { dataSourceFields, isLoading, loadMore } = useInfiniteGetDataSourceFields({
    dataSource: selectedDataSource,
    searchValue,
  });

  const dimensions = useGetDimensionsFromDataSourceFields(dataSourceFields, {
    selectedDataSource,
  });

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
        attributeActionConfig={{
          onClick: onAttributeClick,
        }}
        onScrolledToBottom={loadMore}
        isLoading={isLoading}
        disabledAttributesConfig={
          disabledAttributes && {
            disabledAttributes: disabledAttributes,
            getTooltip: (attribute) =>
              `Filter already exists for ${attribute.name}. Please edit the existing filter, or remove it to add a new one.`,
          }
        }
      />
    </DimensionsBrowserContainer>
  );
};

const useGetDimensionsFromDataSourceFields = (
  dataSourceFields: DataSourceField[] | undefined,
  options: {
    selectedDataSource: DataSource;
  },
): Dimension[] => {
  const { selectedDataSource } = options;
  return useMemo(
    () =>
      dataSourceFields && dataSourceFields.length
        ? getDimensionsFromDataSourceFields(dataSourceFields, selectedDataSource)
        : [],
    [dataSourceFields, selectedDataSource],
  );
};
