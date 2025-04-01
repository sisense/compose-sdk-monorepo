import { CheckIcon } from '@/filters/components/icons';
import { DropdownSelectLabel, SelectIconContainer, SelectItemContainer } from './base';
import { SelectItem } from './types';
import { CSSProperties } from 'react';
import { DEFAULT_TEXT_COLOR } from '@/const';
import { useThemeContext } from '@/theme-provider';

type SingleSelectItemProps<Value> = SelectItem<Value> & {
  selected: boolean;
  onSelect?: (value: Value) => void;
  style?: CSSProperties;
};

export function SingleSelectItem<Value = unknown>(props: SingleSelectItemProps<Value>) {
  const { value, displayValue, icon, selected, onSelect, style } = props;
  const { themeSettings } = useThemeContext();
  return (
    <SelectItemContainer
      theme={themeSettings}
      style={{ paddingRight: '6px' }}
      onClick={() => onSelect?.(value)}
    >
      {icon && <SelectIconContainer>{icon}</SelectIconContainer>}
      <DropdownSelectLabel theme={themeSettings} style={{ paddingRight: selected ? 0 : '24px' }}>
        {displayValue ?? `${value}`}
      </DropdownSelectLabel>
      {selected && <CheckIcon aria-label="check-icon" color={style?.color || DEFAULT_TEXT_COLOR} />}
    </SelectItemContainer>
  );
}
