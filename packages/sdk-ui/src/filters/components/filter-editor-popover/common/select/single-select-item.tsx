import { CheckIcon } from '@/filters/components/icons';
import { SelectItemContainer, SelectLabel } from './base';
import { SelectItem } from './types';

type SingleSelectItemProps<Value> = SelectItem<Value> & {
  selected: boolean;
  onSelect?: (value: Value) => void;
};

export function SingleSelectItem<Value = unknown>(props: SingleSelectItemProps<Value>) {
  const { value, displayValue, selected, onSelect } = props;
  return (
    <SelectItemContainer style={{ paddingRight: '6px' }} onClick={() => onSelect?.(value)}>
      <SelectLabel style={{ paddingRight: selected ? 0 : '24px' }}>
        {displayValue ?? `${value}`}
      </SelectLabel>
      {selected && <CheckIcon aria-label="check-icon" color="#5B6372" />}
    </SelectItemContainer>
  );
}
