import React, { CSSProperties, useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { ArrowDownIcon } from '../../../icons';
import { SelectItem } from './types';
import { SelectField, SelectLabel } from './base';
import { getSelectedItemsDisplayValue } from './utils';
import { SingleSelectItem } from './single-select-item';
import { DEFAULT_TEXT_COLOR } from '@/const';
import {
  ScrollWrapper,
  ScrollWrapperOnScrollEvent,
} from '@/filters/components/filter-editor-popover/common/scroll-wrapper';
import { SmallLoader } from '@/filters/components/filter-editor-popover/common/small-loader';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { Popper } from '@/common/components/popper';
import { SearchInput } from '@/filters/components/filter-editor-popover/common';
import { useTranslation } from 'react-i18next';

const Content = styled.div`
  max-height: 294px;
`;

type SearchableSingleSelectProps<Value> = {
  value?: Value;
  items: SelectItem<Value>[];
  style?: CSSProperties;
  placeholder?: string;
  onChange?: (value: Value) => void;
  primaryColor?: string;
  primaryBackgroundColor?: string;
  onListScroll?: (event: ScrollWrapperOnScrollEvent) => void;
  showListLoader?: boolean;
  showSearch?: boolean;
  onSearchUpdate?: (searchValue: string) => void;
};

/** @internal */
export const StyledSearchInput = styled(SearchInput)<{
  backgroundColor?: string;
  color?: string;
}>`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  color: ${(props) => props.color};
  background-color: ${(props) => props.backgroundColor};
`;

/** @internal */
export function SearchableSingleSelect<Value = unknown>(props: SearchableSingleSelectProps<Value>) {
  const {
    value,
    items,
    style,
    placeholder,
    onChange,
    primaryColor,
    primaryBackgroundColor,
    onListScroll,
    showListLoader,
    showSearch = true,
    onSearchUpdate,
  } = props;
  const { t } = useTranslation();
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
      <div>
        <div style={{ position: 'relative' }}>
          <SelectField
            ref={selectElementRef}
            focus={open}
            onClick={onContainerClick}
            style={{
              ...style,
              ...(primaryColor && { color: primaryColor }),
              ...(primaryBackgroundColor && { backgroundColor: primaryBackgroundColor }),
            }}
            aria-label="Searchable single-select"
          >
            <SelectLabel style={{ opacity: value ? '100%' : '50%' }} aria-label="Value">
              {`${getSelectedItemsDisplayValue(items, [value]) || placeholder}`}
            </SelectLabel>
            <ArrowDownIcon
              aria-label="select-icon"
              fill={primaryColor || DEFAULT_TEXT_COLOR}
              style={{
                minWidth: '24px',
                transform: `rotate(${open ? 180 : 0}deg)`,
              }}
            />
          </SelectField>
          {showSearch && open && (
            <StyledSearchInput
              inputRef={(input) => input?.focus()}
              backgroundColor={primaryBackgroundColor}
              color={primaryColor}
              placeholder={t('filterEditor.placeholders.enterValue')}
              onChange={(e) => {
                onSearchUpdate?.(e.target.value);
              }}
              aria-label="Value input"
            />
          )}
        </div>
        <Popper open={open} anchorEl={selectElementRef.current}>
          <ScrollWrapper onScroll={onListScroll}>
            <Content
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
                  style={{
                    backgroundColor: primaryBackgroundColor,
                    color: primaryColor,
                  }}
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
