import { withLazyLoading } from '@/common/hooks/decorators/with-lazy-loading';
import { useGetDataSourceFields } from '@/common/hooks/fusion-endpoints/use-get-data-source-fields';
import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types.js';
import styled from '@emotion/styled';
import { DataSource, getDimensionsFromDataSourceFields } from '@sisense/sdk-data';
import { useMemo, useState } from 'react';
import { DataSourceSelector } from '../data-source-selector/data-source-selector.js';
import { useDataSourceSelection } from '../data-source-selector/use-data-source-selection.js';
import { DimensionsBrowser } from '../dimensions-browser/dimensions-browser.js';
import { AttributiveElement } from '../dimensions-browser/types.js';
import { SearchInput } from '../search-input/search-input.js';

type AddFilterDataBrowserProps = {
  dataSources: DataSource[];
  initialDataSource: DataSource;
  onAttributeClick: (attribute: AttributiveElement) => void;
};

const DimensionsBrowserContainer = styled.div<Themable>`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 16px 24px;
  gap: 16px;
  background: ${({ theme }) => theme.general.popover.content.backgroundColor};
  color: ${({ theme }) => theme.general.popover.content.textColor};
  svg path {
    fill: ${({ theme }) => theme.general.popover.content.textColor};
  }
`;

/**
 * A component that allows users to select a data source and an attribute to create a filter.
 */
const useInfiniteGetDataSourceFields = withLazyLoading({
  initialCount: 50,
  chunkSize: 50,
  dataKey: 'dataSourceFields',
})(useGetDataSourceFields);

export const AddFilterDataBrowser = (props: AddFilterDataBrowserProps) => {
  const { themeSettings } = useThemeContext();
  const { selectedDataSource, selectDataSource } = useDataSourceSelection(props.initialDataSource);
  const [searchValue, setSearchValue] = useState<string>('');

  const { dataSourceFields, isLoading, loadMore } = useInfiniteGetDataSourceFields({
    dataSource: selectedDataSource,
    searchValue,
  });

  const dimensions = useMemo(
    () =>
      dataSourceFields
        ? getDimensionsFromDataSourceFields(dataSourceFields, selectedDataSource)
        : [],
    [dataSourceFields, selectedDataSource],
  );

  return (
    <DimensionsBrowserContainer theme={themeSettings}>
      <DataSourceSelector
        dataSources={props.dataSources}
        selectedDataSource={selectedDataSource}
        onChange={selectDataSource}
      />
      <SearchInput onChange={setSearchValue} />
      <DimensionsBrowser
        dimensions={dimensions}
        attributeActionConfig={{
          onClick: props.onAttributeClick,
        }}
        onScrolledToBottom={loadMore}
        isLoading={isLoading}
      />
    </DimensionsBrowserContainer>
  );
};
