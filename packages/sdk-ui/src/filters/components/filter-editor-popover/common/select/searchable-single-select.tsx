import { CSSProperties, useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { ArrowDownIcon } from '../../../icons';
import { SelectItem } from './types';
import { SelectContainer, SelectLabel } from './base';
import { SingleSelectItem } from './single-select-item';
import { DEFAULT_TEXT_COLOR } from '@/const';
import {
  ScrollWrapper,
  ScrollWrapperOnScrollEvent,
} from '@/filters/components/filter-editor-popover/common/scroll-wrapper';
import { SmallLoader } from '@/filters/components/filter-editor-popover/common/small-loader';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { Popper } from '@/common/components/popper';

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
};

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
  } = props;
  const [open, setOpen] = useState(false);
  const selectElementRef = useRef<HTMLDivElement | null>(null);

  const handleItemSelect = useCallback(
    (newValue: Value) => {
      onChange?.(newValue);
    },
    [onChange],
  );

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
          aria-label="Searchable single-select"
        >
          <SelectLabel style={{ opacity: value ? '100%' : '50%' }} aria-label="Value">
            {`${value || placeholder}`}
          </SelectLabel>
          <ArrowDownIcon
            aria-label="select-icon"
            fill={primaryColor || DEFAULT_TEXT_COLOR}
            style={{
              minWidth: '24px',
              transform: `rotate(${open ? 180 : 0}deg)`,
            }}
          />
        </SelectContainer>
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
