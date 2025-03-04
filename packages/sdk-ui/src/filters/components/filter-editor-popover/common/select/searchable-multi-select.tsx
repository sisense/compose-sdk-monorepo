import { CSSProperties, useCallback, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { ArrowDownIcon } from '../../../icons';
import { SelectItem } from './types';
import { SelectContainer, SelectLabel } from './base';
import { getSelectedItemsDisplayValue } from './utils';
import { MultiSelectItem } from './multi-select-item';
import { useTranslation } from 'react-i18next';
import {
  ScrollWrapper,
  ScrollWrapperOnScrollEvent,
} from '@/filters/components/filter-editor-popover/common/scroll-wrapper';
import { DEFAULT_TEXT_COLOR } from '@/const';
import { SmallLoader } from '@/filters/components/filter-editor-popover/common/small-loader';
import { Popper } from '@/common/components/popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';

const Content = styled.div`
  max-height: 320px;
`;

const ContentToolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
  border-bottom: 1px solid #e7e8ea;
  margin: 0 10px 0 10px;
  height: 32px;
`;

const ContentToolbarButton = styled.button`
  font-family: 'Open Sans', sans-serif;
  border: none;
  background: none;
  color: #1eaff3;
  padding: 0;
  font-size: 11px;
  &:disabled {
    opacity: 0.4;
  }
`;

const ContentList = styled.div``;

type SearchableMultiSelectProps<Value> = {
  values?: Value[];
  items: SelectItem<Value>[];
  style?: CSSProperties;
  placeholder?: string;
  onChange?: (values: Value[]) => void;
  primaryColor?: string;
  primaryBackgroundColor?: string;
  onListScroll?: (event: ScrollWrapperOnScrollEvent) => void;
  showListLoader?: boolean;
};

/** @internal */
export function SearchableMultiSelect<Value = unknown>(props: SearchableMultiSelectProps<Value>) {
  const {
    items,
    style,
    placeholder,
    onChange,
    primaryColor,
    primaryBackgroundColor,
    onListScroll,
    showListLoader = false,
  } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const selectElementRef = useRef<HTMLDivElement | null>(null);

  const values = useMemo(() => props.values || [], [props.values]);

  const handleItemSelect = useCallback(
    (newValue: Value) => {
      const isAlreadySelected = values.includes(newValue);

      if (isAlreadySelected) {
        onChange?.(values.filter((value) => value !== newValue));
      } else {
        onChange?.([...values, newValue]);
      }
    },
    [values, onChange],
  );

  const handleSelectAll = useCallback(() => {
    onChange?.(items.map(({ value }) => value));
  }, [items, onChange]);

  const handleClearAll = useCallback(() => {
    onChange?.([]);
  }, [onChange]);
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div>
        <SelectContainer
          ref={selectElementRef}
          focus={open}
          onClick={() => setOpen((isOpen) => !isOpen)}
          style={{
            ...style,
            ...(primaryColor && { color: primaryColor }),
            ...(primaryBackgroundColor && { backgroundColor: primaryBackgroundColor }),
          }}
          aria-label="Searchable multi-select"
        >
          <SelectLabel style={{ opacity: values.length ? '100%' : '50%' }} aria-label="Value">
            {getSelectedItemsDisplayValue(items, values) ?? placeholder}
          </SelectLabel>
          <ArrowDownIcon
            fill={primaryColor || DEFAULT_TEXT_COLOR}
            aria-label="Open icon"
            style={{
              minWidth: '24px',
              transform: `rotate(${open ? 180 : 0}deg)`,
            }}
          />
        </SelectContainer>
        <Popper open={open} anchorEl={selectElementRef.current} style={{ maxHeight: 300 }}>
          <ScrollWrapper onScroll={onListScroll}>
            <Content
              style={{
                minWidth: selectElementRef.current?.clientWidth,
                maxWidth:
                  selectElementRef.current?.clientWidth &&
                  selectElementRef.current?.clientWidth * 2,
                backgroundColor: primaryBackgroundColor,
                color: primaryColor,
              }}
              aria-label="Searchable multi-select content"
            >
              <ContentToolbar>
                <ContentToolbarButton
                  style={{ marginRight: '8px' }}
                  disabled={items.length === values.length}
                  onClick={handleSelectAll}
                >
                  {t('filterEditor.buttons.selectAll')}
                </ContentToolbarButton>
                <ContentToolbarButton disabled={!values.length} onClick={handleClearAll}>
                  {t('filterEditor.buttons.clearAll')}
                </ContentToolbarButton>
              </ContentToolbar>
              <ContentList aria-label="List">
                {items.map((item, index) => (
                  <MultiSelectItem
                    key={index}
                    style={{
                      backgroundColor: primaryBackgroundColor,
                      color: primaryColor,
                    }}
                    {...item}
                    selected={!!values?.includes(item.value)}
                    onSelect={handleItemSelect}
                  />
                ))}
                {showListLoader && <SmallLoader />}
              </ContentList>
            </Content>
          </ScrollWrapper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
