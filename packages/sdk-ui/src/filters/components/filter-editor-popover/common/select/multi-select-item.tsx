import { SelectItemContainer, SelectLabel } from './base';
import { SelectItem } from './types';
import { Checkbox } from '../../../common';
import { CSSProperties } from 'react';

type MultiSelectItemProps<Value> = SelectItem<Value> & {
  selected: boolean;
  onSelect?: (value: Value) => void;
  style?: CSSProperties;
};

export function MultiSelectItem<Value = unknown>(props: MultiSelectItemProps<Value>) {
  const { value, displayValue, selected, onSelect, style } = props;
  return (
    <SelectItemContainer
      color={style?.color}
      background={style?.backgroundColor}
      style={{ height: '36px', paddingLeft: '8px' }}
      onClick={() => onSelect?.(value)}
    >
      <Checkbox
        checked={selected}
        readOnly={true}
        style={{ width: '13px', height: '13px', marginRight: '12px' }}
      />
      <SelectLabel>{displayValue ?? `${value}`}</SelectLabel>
    </SelectItemContainer>
  );
}
