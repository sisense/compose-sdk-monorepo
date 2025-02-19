import { CheckIcon } from '@/filters/components/icons';
import { SelectItemContainer, SelectLabel } from './base';
import { SelectItem } from './types';
import { CSSProperties } from 'react';
import { DEFAULT_TEXT_COLOR } from '@/const';

type SingleSelectItemProps<Value> = SelectItem<Value> & {
  selected: boolean;
  onSelect?: (value: Value) => void;
  style?: CSSProperties;
};

export function SingleSelectItem<Value = unknown>(props: SingleSelectItemProps<Value>) {
  const { value, displayValue, selected, onSelect, style } = props;
  return (
    <SelectItemContainer
      color={style?.color}
      background={style?.backgroundColor}
      style={{ paddingRight: '6px' }}
      onClick={() => onSelect?.(value)}
    >
      <SelectLabel style={{ paddingRight: selected ? 0 : '24px', color: style?.color }}>
        {displayValue ?? `${value}`}
      </SelectLabel>
      {selected && <CheckIcon aria-label="check-icon" color={style?.color || DEFAULT_TEXT_COLOR} />}
    </SelectItemContainer>
  );
}
