import { useMemo, useState } from 'react';

import { Dimension, DimensionalDimension } from '@sisense/sdk-data';

import { useThemeContext } from '@/infra/contexts/theme-provider';

import { DimensionsBrowser } from '../dimensions-browser/dimensions-browser.js';
import { SearchInput } from '../search-input/search-input.js';
import { DimensionsBrowserContainer } from './data-schema-browser.styles.js';

type DataSchemaBrowserProps = {
  dimensions: Dimension[];
  collapseAll?: boolean;
};

/**
 * A component that displays a list of dimensions and attributes for a given data source.
 *
 * @param params DataSchemaBrowserProps
 * @returns ReactElement
 * @internal
 */
export const DataSchemaBrowser = ({ dimensions, collapseAll }: DataSchemaBrowserProps) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [collapsed, setCollapsed] = useState<boolean>(!!collapseAll);

  const { themeSettings } = useThemeContext();

  const filteredDimensions = useMemo(() => {
    const hasSearchValue = (value: string, searchValue: string) =>
      value.toLowerCase().includes(searchValue.toLowerCase());
    if (searchValue && searchValue.trim() !== '') {
      return dimensions
        .map((dim) => {
          if (hasSearchValue(dim.name, searchValue)) return dim;

          const filteredAttributes = dim.attributes.filter((attr) =>
            hasSearchValue(attr.name, searchValue),
          );
          const filteredDimensions = dim.dimensions.filter((d) =>
            hasSearchValue(d.name, searchValue),
          );
          return new DimensionalDimension(
            dim.name,
            dim.expression,
            filteredAttributes,
            filteredDimensions,
            dim.type,
            dim.description,
            undefined,
            dim?.dataSource,
          );
        })
        .filter(
          ({ name, attributes, dimensions: dims }) =>
            attributes.length > 0 || dims.length > 0 || hasSearchValue(name, searchValue),
        );
    }
    return dimensions;
  }, [dimensions, searchValue]);

  return (
    <DimensionsBrowserContainer theme={themeSettings}>
      <SearchInput
        onChange={(value) => {
          setSearchValue(value);
          if (value.trim() !== '') {
            setCollapsed(false);
          }
        }}
      />
      <DimensionsBrowser dimensions={filteredDimensions ?? []} collapseAll={collapsed} />
    </DimensionsBrowserContainer>
  );
};
