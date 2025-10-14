import { useCallback, useState } from 'react';

import { DataSource, Filter } from '@sisense/sdk-data';

import { AddFilterPopover } from '@/data-browser/add-filter-popover';
import { AttributiveElement } from '@/data-browser/dimensions-browser/types';

import { FilterEditorPopover } from '../../filter-editor-popover/filter-editor-popover';
import { UseNewFilterCreationConfig } from '../types';

type UseNewFilterCreationParams = {
  defaultDataSource?: DataSource;
  dataSources: DataSource[];
  onFilterCreated: (filter: Filter) => void;
  config?: UseNewFilterCreationConfig;
  disabledAttributes?: AttributiveElement[];
};

type UseNewFilterCreationReturn = {
  NewFilterCreator: () => JSX.Element | null;
  startFilterCreation: (anchorEl: HTMLElement) => void;
};

/**
 * Hook that keeps new filter creation process.
 * Returns a function to start creation a new filter and a component that renders the filter creation popovers.
 */
export const useNewFilterCreation = ({
  dataSources,
  onFilterCreated,
  defaultDataSource,
  config,
  disabledAttributes,
}: UseNewFilterCreationParams): UseNewFilterCreationReturn => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [emptyFilterToEdit, setEmptyFilterToEdit] = useState<Filter | null>(null);
  const [isAddFilterPopoverOpen, setIsAddFilterPopoverOpen] = useState<boolean>(false);

  return {
    NewFilterCreator: useCallback(() => {
      return config?.enabled && anchorEl ? (
        <>
          <AddFilterPopover
            anchorEl={anchorEl}
            isOpen={isAddFilterPopoverOpen}
            dataSources={dataSources}
            initialDataSource={dataSources[0]}
            disabledAttributes={disabledAttributes}
            onFilterCreated={(filter) => {
              setEmptyFilterToEdit(filter);
              setIsAddFilterPopoverOpen(false);
            }}
            onClose={() => {
              setIsAddFilterPopoverOpen(false);
              setEmptyFilterToEdit(null);
            }}
          />
          <FilterEditorPopover
            filter={emptyFilterToEdit}
            position={{
              anchorEl,
            }}
            onChange={(filter) => {
              onFilterCreated(filter);
              setEmptyFilterToEdit(null);
            }}
            onClose={() => {
              setEmptyFilterToEdit(null);
            }}
            config={config}
            defaultDataSource={defaultDataSource}
          />
        </>
      ) : null;
    }, [
      config,
      anchorEl,
      isAddFilterPopoverOpen,
      dataSources,
      disabledAttributes,
      emptyFilterToEdit,
      defaultDataSource,
      onFilterCreated,
    ]),
    startFilterCreation: useCallback((anchorEl: HTMLElement) => {
      setAnchorEl(anchorEl);
      setIsAddFilterPopoverOpen(true);
    }, []),
  };
};
