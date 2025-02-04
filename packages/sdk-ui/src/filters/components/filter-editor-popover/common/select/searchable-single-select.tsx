import { CSSProperties, useCallback, useRef, useState } from 'react';
import { ArrowDownIcon } from '../../../icons';
import { Popover } from '@/common/components/popover';
import { SelectItem } from './types';
import { SelectContainer, SelectLabel } from './base';
import { calculatePopoverPosition } from './utils';
import { SingleSelectItem } from './single-select-item';

type SearchableSingleSelectProps<Value> = {
  value?: Value;
  items: SelectItem<Value>[];
  style?: CSSProperties;
  placeholder?: string;
  onChange?: (value: Value) => void;
};

/** @internal */
export function SearchableSingleSelect<Value = unknown>(props: SearchableSingleSelectProps<Value>) {
  const { value, items, style, placeholder, onChange, ...rest } = props;
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
        style={style}
        {...rest}
      >
        <SelectLabel style={{ opacity: value ? '100%' : '50%' }}>
          {`${value || placeholder}`}
        </SelectLabel>
        <ArrowDownIcon
          aria-label="select-icon"
          fill="#5B6372"
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
        <div
          style={{
            minWidth: selectElementRef.current?.clientWidth,
            maxWidth:
              selectElementRef.current?.clientWidth && selectElementRef.current?.clientWidth * 2,
          }}
        >
          {items.map((item, index) => (
            <SingleSelectItem
              key={index}
              {...item}
              selected={value === item.value}
              onSelect={handleItemSelect}
            />
          ))}
        </div>
      </Popover>
    </>
  );
}
