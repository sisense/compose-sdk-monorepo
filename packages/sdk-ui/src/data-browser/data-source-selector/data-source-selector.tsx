import React, { useState } from 'react';

import { ArrowIcon } from '@/common/icons/arrow-icon';
import styled from '@emotion/styled';
import { DataSource } from '@sisense/sdk-data';
import { ElasticubeIcon } from '@/common/icons/elasticube-icon';
import { ApprovalIcon } from '@/common/icons/approval-icon';
import {
  toDataSourceObject,
  DataSourceObject,
  getDataSourceTitle,
} from '@/utils/data-sources-utils';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import { Popover } from '@/common/components/popover';
import List from '@mui/material/List';
import { Themable } from '@/theme-provider/types';
import { useThemeContext } from '@/theme-provider';
import { getSlightlyDifferentColor } from '@/utils/color';
import { ElementStates } from '@/types';
import { getElementStateColor } from '@/theme-provider/utils';

export type DataSourceSelectorProps = {
  dataSources: DataSource[];
  selectedDataSource: DataSource;
  onChange: (dataSource: DataSource) => void;
};

export function DataSourceSelector({
  dataSources,
  selectedDataSource,
  onChange,
}: DataSourceSelectorProps) {
  const { themeSettings } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleSelect = (ds: DataSource) => {
    onChange(ds);
    handleClosePopover();
  };

  const dataSourceObjects = dataSources.map(toDataSourceObject);
  const findDataSourceByDataSourceObject = createFindDataSourceByDataSourceObject(dataSources);

  return (
    <>
      <SelectorButton
        onClick={handleOpenPopover}
        startIcon={<ElasticubeIcon />}
        endIcon={<ArrowIcon direction="down" />}
        theme={themeSettings}
      >
        <ShrinkableText>
          {selectedDataSource ? getDataSourceTitle(selectedDataSource) : 'Select data source'}
        </ShrinkableText>
      </SelectorButton>

      <DataSourceSelectorPopover
        position={
          anchorEl
            ? {
                anchorEl: anchorEl,
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                contentOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
              }
            : undefined
        }
        open={isOpen}
        onClose={handleClosePopover}
        theme={themeSettings}
      >
        <DataSourcesList theme={themeSettings}>
          {dataSourceObjects.map((ds) => {
            const isSelected = findDataSourceByDataSourceObject(ds) === selectedDataSource;
            return (
              <DataSourcesListItem
                key={ds.id}
                selected={isSelected}
                onClick={() => handleSelect(findDataSourceByDataSourceObject(ds))}
                theme={themeSettings}
              >
                <DataSourceItem dataSourceTitle={ds.title} isSelected={isSelected} />
              </DataSourcesListItem>
            );
          })}
        </DataSourcesList>
      </DataSourceSelectorPopover>
    </>
  );
}

const createFindDataSourceByDataSourceObject = (dataSources: DataSource[]) => {
  const datasourcesMap: Record<string, DataSource> = dataSources.reduce((acc, ds) => {
    const dsObject = toDataSourceObject(ds);
    return { ...acc, [dsObject.id]: ds };
  }, {});
  return (dataSourceObject: DataSourceObject): DataSource => {
    const foundDataSource = datasourcesMap[dataSourceObject.id];
    if (!foundDataSource) {
      throw new Error(`Could not find data source with id ${dataSourceObject.id}`);
    }
    return foundDataSource;
  };
};

const DataSourceItem = ({
  dataSourceTitle,
  isSelected,
}: {
  dataSourceTitle: string;
  isSelected: boolean;
}) => {
  return (
    <DataSourceItemContainer isSelected={isSelected}>
      <ElasticubeIcon />
      <ShrinkableText>{dataSourceTitle}</ShrinkableText>
      <ApprovalIcon />
    </DataSourceItemContainer>
  );
};

const DataSourceItemContainer = styled.div<Selectable>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  & > :last-child {
    margin-left: auto;
    opacity: ${({ isSelected }) => (isSelected ? 1 : 0)};
  }
`;

type Selectable = {
  isSelected?: boolean;
};

const DataSourcesListItem = styled(ListItem)<Themable>`
  padding: 2px 4px;
  gap: 4px;
  width: 100%;

  font-size: 13px;
  font-weight: 400;

  color: ${({ theme }) => theme.general.popover.input.dropdownList.item.textColor};
  background-color: ${({ theme }) =>
    getElementStateColor(
      theme.general.popover.input.dropdownList.item.backgroundColor,
      ElementStates.DEFAULT,
    )};

  &:hover {
    cursor: pointer;
    color: ${({ theme }) =>
      getElementStateColor(
        theme.general.popover.input.dropdownList.item.textColor,
        ElementStates.HOVER,
      )};
    background-color: ${({ theme }) =>
      getElementStateColor(
        theme.general.popover.input.dropdownList.item.backgroundColor,
        ElementStates.HOVER,
      )};
  }

  svg path {
    fill: ${({ theme }) =>
      getElementStateColor(
        theme.general.popover.input.dropdownList.item.textColor,
        ElementStates.DEFAULT,
      )};
  }
`;

const CLASSNAME = {
  BTN_ROOT: '.MuiButtonBase-root',
  BTN_START_ICON: '.MuiButton-startIcon',
  BTN_END_ICON: '.MuiButton-endIcon',
  POPOVER_PAPER_ROOT: '.MuiPaper-root',
};
const SelectorButton = styled(Button)<Themable>`
  & ${CLASSNAME.BTN_START_ICON} {
    margin: 0;
  }
  & ${CLASSNAME.BTN_END_ICON} {
    margin: 0;
  }
  &${CLASSNAME.BTN_ROOT} {
    height: 28px;
    max-width: 100%;
    margin-right: auto;
    padding: 0;
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
    color: ${({ theme }) => theme.general.popover.content.textColor};
    background: ${({ theme }) => theme.general.popover.content.backgroundColor};
    text-transform: none;

    & :hover {
      background-color: ${({ theme }) =>
        getSlightlyDifferentColor(theme.general.popover.content.backgroundColor)};
    }
  }
`;

const ShrinkableText = styled.span`
  width: 100%;
  text-transform: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DataSourceSelectorPopover = styled(Popover)<Themable>`
  & ${CLASSNAME.POPOVER_PAPER_ROOT} {
    //main container - 2x padding
    max-width: 433px;
    box-shadow: ${({ theme }) => theme.general.popover.input.dropdownList.shadow};
  }
`;

const DataSourcesList = styled(List)<Themable>`
  max-height: 250px;
  overflow-y: auto;
  padding: 4px 0 8px;
  color: ${({ theme }) =>
    getElementStateColor(
      theme.general.popover.input.dropdownList.textColor,
      ElementStates.DEFAULT,
    )};
  background-color: ${({ theme }) =>
    getElementStateColor(
      theme.general.popover.input.dropdownList.backgroundColor,
      ElementStates.DEFAULT,
    )};
`;
