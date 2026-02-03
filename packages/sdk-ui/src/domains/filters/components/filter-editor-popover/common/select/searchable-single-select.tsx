import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ClickAwayListener from '@mui/material/ClickAwayListener';

import { SearchInput } from '@/domains/filters/components/filter-editor-popover/common';
import {
  ScrollWrapper,
  ScrollWrapperOnScrollEvent,
} from '@/domains/filters/components/filter-editor-popover/common/scroll-wrapper';
import { SmallLoader } from '@/domains/filters/components/filter-editor-popover/common/small-loader';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';
import { Popper } from '@/shared/components/popper';
import { DEFAULT_TEXT_COLOR } from '@/shared/const';

import { ArrowDownIcon } from '../../../icons';
import { SelectField, SelectLabel } from './base';
import { SingleSelectItem } from './single-select-item';
import { SelectItem } from './types';
import { getSelectedItemsDisplayValue } from './utils';

const Content = styled.div<Themable>`
  max-height: 294px;
  color: ${({ theme }) => theme.general.popover.input.dropdownList.textColor};
  background-color: ${({ theme }) => theme.general.popover.input.dropdownList.backgroundColor};
  border-radius: ${({ theme }) => theme.general.popover.input.dropdownList.cornerRadius};
  box-shadow: ${({ theme }) => theme.general.popover.input.dropdownList.shadow};
`;

type SearchableSingleSelectProps<Value> = {
  value?: Value;
  items: SelectItem<Value>[];
  width?: number | string;
  placeholder?: string;
  onChange?: (value: Value) => void;
  onListScroll?: (event: ScrollWrapperOnScrollEvent) => void;
  showListLoader?: boolean;
  showSearch?: boolean;
  onSearchUpdate?: (searchValue: string) => void;
};

/** @internal */
export const StyledSearchInput = styled(SearchInput)<Themable>`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  color: ${({ theme }) => theme.general.popover.input.textColor};
  background-color: ${({ theme }) => theme.general.popover.input.backgroundColor};
  border-radius: ${({ theme }) => theme.general.popover.input.cornerRadius};

  svg path {
    fill: ${({ theme }) => theme.general.popover.input.textColor};
  }
`;

/** @internal */
export function SearchableSingleSelect<Value = unknown>(props: SearchableSingleSelectProps<Value>) {
  const {
    value,
    items,
    placeholder,
    onChange,
    onListScroll,
    showListLoader,
    showSearch = true,
    onSearchUpdate,
    width,
  } = props;
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const [open, setOpen] = useState(false);
  const selectElementRef = useRef<HTMLDivElement | null>(null);

  const handleItemSelect = useCallback(
    (newValue: Value) => {
      onChange?.(newValue);
    },
    [onChange],
  );

  const onClose = useCallback(() => {
    setOpen(false);
    onSearchUpdate?.('');
  }, [onSearchUpdate]);

  const onContainerClick = useCallback(() => {
    if (open) {
      onClose();
    } else {
      setOpen(true);
    }
  }, [open, onClose]);

  return (
    <ClickAwayListener onClickAway={onClose}>
      <div style={{ width }}>
        <div style={{ position: 'relative' }}>
          <SelectField
            ref={selectElementRef}
            focus={open}
            onClick={onContainerClick}
            theme={themeSettings}
            aria-label="Searchable single-select"
          >
            <SelectLabel
              theme={themeSettings}
              style={{ opacity: value ? '100%' : '50%' }}
              aria-label="Value"
            >
              {`${getSelectedItemsDisplayValue(items, [value]) || placeholder}`}
            </SelectLabel>
            <ArrowDownIcon
              aria-label="select-icon"
              fill={themeSettings.general.popover.input.textColor || DEFAULT_TEXT_COLOR}
              style={{
                minWidth: '24px',
                transform: `rotate(${open ? 180 : 0}deg)`,
              }}
            />
          </SelectField>
          {showSearch && open && (
            <StyledSearchInput
              inputRef={(input) => input?.focus()}
              theme={themeSettings}
              placeholder={t('filterEditor.placeholders.enterValue')}
              onChange={(e) => {
                onSearchUpdate?.(e.target.value);
              }}
              aria-label="Value input"
            />
          )}
        </div>
        <Popper open={open} anchorEl={selectElementRef.current} preventClickPropagation={true}>
          <ScrollWrapper onScroll={onListScroll}>
            <Content
              theme={themeSettings}
              style={{
                minWidth: selectElementRef.current?.clientWidth,
                maxWidth:
                  selectElementRef.current?.clientWidth &&
                  selectElementRef.current?.clientWidth * 2,
              }}
              aria-label="Searchable single-select content"
            >
              {items.map((item, index) => (
                <SingleSelectItem
                  key={index}
                  {...item}
                  selected={value === item.value}
                  onSelect={handleItemSelect}
                />
              ))}
              {showListLoader && <SmallLoader />}
            </Content>
          </ScrollWrapper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
