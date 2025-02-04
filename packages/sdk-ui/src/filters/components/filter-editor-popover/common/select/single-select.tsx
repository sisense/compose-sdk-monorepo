import { CSSProperties, useCallback, useRef, useState } from 'react';
import { ArrowDownIcon } from '../../../icons';
import { Popover } from '@/common/components/popover';
import { SelectItem } from './types';
import { calculatePopoverPosition, getSelectedItemsDisplayValue } from './utils';
import { SelectContainer, SelectLabel } from './base';
import { SingleSelectItem } from './single-select-item';

type SelectProps<Value> = {
  value?: Value;
  multiple?: boolean;
  items: SelectItem<Value>[];
  style?: CSSProperties;
  onChange?: (value: Value) => void;
};

/** @internal */
export function SingleSelect<Value = unknown>(props: SelectProps<Value>) {
  const { value, items, style, onChange, ...rest } = props;

  const [open, setOpen] = useState(false);
  const selectElementRef = useRef<HTMLDivElement | null>(null);

  const handleItemSelect = useCallback(
    (newValue: Value) => {
      onChange?.(newValue);
      setOpen(false);
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
        <SelectLabel>{getSelectedItemsDisplayValue(items, [value])}</SelectLabel>
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
        position={calculatePopoverPosition(selectElementRef.current, items.length * 28)}
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
              selected={item.value === value}
              onSelect={handleItemSelect}
            />
          ))}
        </div>
      </Popover>
    </>
  );
}
