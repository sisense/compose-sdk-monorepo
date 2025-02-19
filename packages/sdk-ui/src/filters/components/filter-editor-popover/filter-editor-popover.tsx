import { useState } from 'react';
import styled from '@emotion/styled';
import { type Filter } from '@sisense/sdk-data';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverAnchorPosition } from '@/common/components/popover';

import { CubeIcon } from '../icons';
import Stack from '@mui/material/Stack';
import { Button } from '@/common/components/button';
import { FilterEditor } from './filter-editor';
import { useThemeContext } from '@/theme-provider';

type FilterEditorPopoverPosition = Pick<PopoverAnchorPosition, 'anchorEl'>;

type FilterEditorPopoverProps = {
  filter?: Filter | null;
  position?: FilterEditorPopoverPosition;
  onChange?: (filter: Filter) => void;
  onClose?: () => void;
};

const ModalHeader = styled.div`
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

const ModalHeaderInfo = styled.span`
  display: flex;
  align-items: center;
  font-size: 13px;
  box-sizing: border-box;
  color: inherit;
  column-gap: 5px;
`;

const ModalHeaderVerticalDivider = styled.span`
  display: inline-block;
  width: 1px;
  height: 24px;
  background: #3a4356;
  margin: 0 16px;
  box-sizing: border-box;
`;

const ModalFooter = styled.div`
  display: flex;
  height: 61px;
  align-items: center;
  padding: 12px;
  box-sizing: border-box;
  padding: 0 16px;
`;

const Container = styled.div`
  width: 700px;
`;

/** @internal */
export const FilterEditorPopover = ({
  filter,
  position,
  onChange,
  onClose,
}: FilterEditorPopoverProps) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
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
      <Container
        style={{
          backgroundColor: themeSettings.general.backgroundColor,
          color: themeSettings.typography.primaryTextColor,
        }}
      >
        <ModalHeader
          style={{
            backgroundColor: themeSettings.filter.panel.backgroundColor,
            color: themeSettings.typography.secondaryTextColor,
          }}
        >
          <ModalHeaderTitle data-testid="filter-editor-popover-header-attribute">
            {filter?.attribute.name}
          </ModalHeaderTitle>
          <ModalHeaderVerticalDivider />
          <ModalHeaderInfo style={{ backgroundColor: themeSettings.filter.panel.backgroundColor }}>
            <CubeIcon aria-label="cube-icon" color={themeSettings.typography.secondaryTextColor} />
            <span data-testid="filter-editor-popover-header-datasource">
              {filter?.attribute.dataSource?.title}
            </span>
          </ModalHeaderInfo>
        </ModalHeader>
        <FilterEditor filter={filter} onChange={(filter) => setEditedFilter(filter)} />
        <ModalFooter
          style={{ borderTop: `1px solid ${themeSettings.filter.panel.backgroundColor}` }}
        >
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
