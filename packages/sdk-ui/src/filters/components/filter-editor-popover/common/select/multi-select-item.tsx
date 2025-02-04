import { SelectItemContainer, SelectLabel } from './base';
import { SelectItem } from './types';
import { Checkbox } from '../../../common';

type MultiSelectItemProps<Value> = SelectItem<Value> & {
  selected: boolean;
  onSelect?: (value: Value) => void;
};

export function MultiSelectItem<Value = unknown>(props: MultiSelectItemProps<Value>) {
  const { value, displayValue, selected, onSelect } = props;
  return (
    <SelectItemContainer
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
