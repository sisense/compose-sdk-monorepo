import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import { DataSource, type Filter } from '@sisense/sdk-data';

import { Button } from '@/common/components/button';
import { Popover, PopoverAnchorPosition } from '@/common/components/popover';
import styled from '@/styled';
import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';

import { CubeIcon } from '../icons';
import { FilterEditor } from './filter-editor';
import { FilterEditorConfig } from './types';

type FilterEditorPopoverPosition = Pick<PopoverAnchorPosition, 'anchorEl'>;

type FilterEditorPopoverProps = {
  filter?: Filter | null;
  parentFilters?: Filter[];
  position?: FilterEditorPopoverPosition;
  onChange?: (filter: Filter) => void;
  onClose?: () => void;
  /** Default data source used for filter attribute */
  defaultDataSource?: DataSource;
  config?: FilterEditorConfig;
};

const ModalHeader = styled.div<Themable>`
  background-color: ${({ theme }) => theme.general.popover.header.backgroundColor};
  color: ${({ theme }) => theme.general.popover.header.textColor};
  display: flex;
  height: 42px;
  align-items: center;
  border-radius: 4px;
  padding: 12px;
  box-sizing: border-box;
`;

const ModalHeaderTitle = styled.span`
  height: 24px;
  font-size: 15px;
  font-weight: 700;
  padding-left: 16px;
  line-height: 24px;
  color: inherit;
`;

const ModalHeaderInfo = styled.span<Themable>`
  display: flex;
  align-items: center;
  font-size: 13px;
  box-sizing: border-box;
  color: inherit;
  column-gap: 5px;
  background-color: ${({ theme }) => theme.general.popover.header.backgroundColor};
`;

const ModalHeaderVerticalDivider = styled.span`
  display: inline-block;
  width: 1px;
  height: 24px;
  background: #3a4356;
  margin: 0 16px;
  box-sizing: border-box;
`;

const ModalFooter = styled.div<Themable>`
  display: flex;
  height: 61px;
  align-items: center;
  padding: 12px;
  box-sizing: border-box;
  padding: 0 16px;
  border-top: 1px solid #e7e8ea;
  background-color: ${({ theme }) => theme.general.popover.footer.backgroundColor};
  color: ${({ theme }) => theme.general.popover.footer.textColor};
`;

const Container = styled.div<Themable>`
  background-color: ${({ theme }) => theme.general.popover.content.backgroundColor};
  border-radius: ${({ theme }) => theme.general.popover.cornerRadius};
  box-shadow: ${({ theme }) => theme.general.popover.shadow};
  color: ${({ theme }) => theme.general.popover.content.textColor};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  width: 700px;
`;

/** @internal */
export const FilterEditorPopover = ({
  filter,
  parentFilters,
  position,
  onChange,
  onClose,
  defaultDataSource,
  config,
}: FilterEditorPopoverProps) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const popoverTheme = themeSettings.general.popover;
  const [editedFilter, setEditedFilter] = useState<Filter | null>(filter ?? null);
  const shouldShowPopover = !!(filter && position);

  if (!shouldShowPopover) {
    return null;
  }

  return (
    <Popover
      open={shouldShowPopover}
      position={{
        anchorEl: position.anchorEl,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'left',
        },
        contentOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      }}
      onClose={onClose}
      aria-label="Filter editor popover"
    >
      <Container theme={themeSettings}>
        <ModalHeader theme={themeSettings}>
          <ModalHeaderTitle data-testid="filter-editor-popover-header-attribute">
            {filter?.attribute.title}
          </ModalHeaderTitle>
          <ModalHeaderVerticalDivider />
          <ModalHeaderInfo theme={themeSettings}>
            <CubeIcon aria-label="cube-icon" color={popoverTheme.header.textColor} />
            <span data-testid="filter-editor-popover-header-datasource">
              {filter?.attribute.dataSource?.title}
            </span>
          </ModalHeaderInfo>
        </ModalHeader>
        <FilterEditor
          filter={filter}
          parentFilters={parentFilters}
          onChange={(filter) => setEditedFilter(filter)}
          defaultDataSource={defaultDataSource}
          config={config}
        />
        <ModalFooter theme={themeSettings}>
          <Stack
            direction="row"
            spacing="10px"
            sx={{
              width: '100%',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <Button
              onClick={() => editedFilter && onChange?.(editedFilter)}
              disabled={!editedFilter}
            >
              {t('filterEditor.buttons.apply')}
            </Button>
            <Button type="secondary" onClick={onClose}>
              {t('filterEditor.buttons.cancel')}
            </Button>
          </Stack>
        </ModalFooter>
      </Container>
    </Popover>
  );
};
