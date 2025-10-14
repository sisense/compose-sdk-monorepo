import { CSSProperties } from 'react';

import { useThemeContext } from '@/theme-provider';

import { Checkbox } from '../../../common';
import { DropdownSelectLabel, SelectItemContainer } from './base';
import { SelectItem } from './types';

type MultiSelectItemProps<Value> = SelectItem<Value> & {
  selected: boolean;
  onSelect?: (value: Value) => void;
  style?: CSSProperties;
};

export function MultiSelectItem<Value = unknown>(props: MultiSelectItemProps<Value>) {
  const { themeSettings } = useThemeContext();
  const { value, displayValue, selected, onSelect } = props;
  return (
    <SelectItemContainer
      theme={themeSettings}
      style={{ height: '36px', paddingLeft: '8px' }}
      onClick={() => onSelect?.(value)}
    >
      <Checkbox
        checked={selected}
        readOnly={true}
        style={{ width: '13px', height: '13px', marginRight: '12px' }}
        labelProps={{ onClick: (e) => e.preventDefault() }}
      />
      <DropdownSelectLabel theme={themeSettings}>{displayValue ?? `${value}`}</DropdownSelectLabel>
    </SelectItemContainer>
  );
}
