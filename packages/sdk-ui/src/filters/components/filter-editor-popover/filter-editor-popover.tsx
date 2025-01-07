import { useRef } from 'react';
import styled from '@emotion/styled';
import { type Filter } from '@sisense/sdk-data';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverAnchorPosition } from '@/common/components/popover';

import { CubeIcon } from '../icons';
import { Stack } from '@mui/material';
import { Button } from '@/common/components/button';

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
  background: #f4f4f8;
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
  color: #5b6372;
`;

const ModalHeaderInfo = styled.span`
  display: flex;
  align-items: center;
  font-size: 13px;
  box-sizing: border-box;
  color: #5b6372;
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
  border-top: 1px solid #e7e8ea;
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
  const editedFilter = useRef<Filter | null>({} as Filter | null);
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
      data-testid="filter-editor-popover"
    >
      <Container>
        <ModalHeader>
          <ModalHeaderTitle data-testid="filter-editor-popover-header-attribute">
            {filter?.attribute.name}
          </ModalHeaderTitle>
          <ModalHeaderVerticalDivider />
          <ModalHeaderInfo>
            <CubeIcon aria-label="cube-icon" color="#5B6372" />
            <span data-testid="filter-editor-popover-header-datasource">
              {filter?.attribute.dataSource?.title}
            </span>
          </ModalHeaderInfo>
        </ModalHeader>
        <ModalFooter>
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
              onClick={() => editedFilter.current && onChange?.(editedFilter.current)}
              data-testid="filter-editor-popover-apply-button"
            >
              {t('filterEditor.buttons.apply')}
            </Button>
            <Button
              type="secondary"
              onClick={onClose}
              data-testid="filter-editor-popover-cancel-button"
            >
              {t('filterEditor.buttons.cancel')}
            </Button>
          </Stack>
        </ModalFooter>
      </Container>
    </Popover>
  );
};
