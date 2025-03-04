import { CSSProperties, useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { ArrowDownIcon } from '../../../icons';
import { SelectItem } from './types';
import { SelectContainer, SelectIconContainer, SelectLabel } from './base';
import { SingleSelectItem } from './single-select-item';
import { DEFAULT_TEXT_COLOR } from '@/const';
import { Popper } from '@/common/components/popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';

const Content = styled.div``;

type SelectProps<Value> = {
  value?: Value;
  multiple?: boolean;
  items: SelectItem<Value>[];
  style?: CSSProperties;
  onChange?: (value: Value) => void;
  primaryColor?: string;
  primaryBackgroundColor?: string;
};

/** @internal */
export function SingleSelect<Value = unknown>(props: SelectProps<Value>) {
  const { value, items, style, onChange, primaryColor, primaryBackgroundColor, ...rest } = props;

  const [open, setOpen] = useState(false);
  const selectElementRef = useRef<HTMLDivElement | null>(null);
  const selectedItem = items.find((item) => item.value === value);

  const handleItemSelect = useCallback(
    (newValue: Value) => {
      onChange?.(newValue);
      setOpen(false);
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
          {...rest}
        >
          {selectedItem?.icon && <SelectIconContainer>{selectedItem?.icon}</SelectIconContainer>}
          <SelectLabel style={{ color: primaryColor }} aria-label="Value">
            <>{selectedItem?.displayValue ?? selectedItem?.value}</>
          </SelectLabel>
          <ArrowDownIcon
            aria-label="Select icon"
            fill={primaryColor || DEFAULT_TEXT_COLOR}
            style={{
              minWidth: '24px',
              transform: `rotate(${open ? 180 : 0}deg)`,
            }}
          />
        </SelectContainer>
        <Popper open={open} anchorEl={selectElementRef.current}>
          <Content
            style={{
              minWidth: selectElementRef.current?.clientWidth,
              maxWidth:
                selectElementRef.current?.clientWidth && selectElementRef.current?.clientWidth * 2,
              ...(primaryBackgroundColor ? { backgroundColor: primaryBackgroundColor } : null),
            }}
            aria-label="Single-select content"
          >
            {items.map((item, index) => (
              <SingleSelectItem
                key={index}
                style={{
                  backgroundColor: primaryBackgroundColor,
                  color: primaryColor,
                }}
                {...item}
                selected={item.value === value}
                onSelect={handleItemSelect}
              />
            ))}
          </Content>
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
