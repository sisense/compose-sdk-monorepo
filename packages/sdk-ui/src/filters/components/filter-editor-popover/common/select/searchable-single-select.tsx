import { CSSProperties, useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { ArrowDownIcon } from '../../../icons';
import { Popover } from '@/common/components/popover';
import { SelectItem } from './types';
import { SelectContainer, SelectLabel } from './base';
import { calculatePopoverPosition } from './utils';
import { SingleSelectItem } from './single-select-item';
import { DEFAULT_TEXT_COLOR } from '@/const';

const Content = styled.div``;

type SearchableSingleSelectProps<Value> = {
  value?: Value;
  items: SelectItem<Value>[];
  style?: CSSProperties;
  placeholder?: string;
  onChange?: (value: Value) => void;
  primaryColor?: string;
  primaryBackgroundColor?: string;
};

/** @internal */
export function SearchableSingleSelect<Value = unknown>(props: SearchableSingleSelectProps<Value>) {
  const { value, items, style, placeholder, onChange, primaryColor, primaryBackgroundColor } =
    props;
  const [open, setOpen] = useState(false);
  const selectElementRef = useRef<HTMLDivElement | null>(null);

  const handleItemSelect = useCallback(
    (newValue: Value) => {
      onChange?.(newValue);
    },
    [onChange],
  );

  return (
    <>
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
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        position={calculatePopoverPosition(selectElementRef.current, 10 * 20)}
      >
        <Content
          style={{
            minWidth: selectElementRef.current?.clientWidth,
            maxWidth:
              selectElementRef.current?.clientWidth && selectElementRef.current?.clientWidth * 2,
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
        </Content>
      </Popover>
    </>
  );
}
