import { CSSProperties } from 'react';

import { useThemeContext } from '@/infra/contexts/theme-provider';

import { Checkbox } from '../../../common/index.js';
import { DropdownSelectLabel, SelectItemContainer } from './base.js';
import { SelectItem } from './types.js';

type MultiSelectItemProps<Value> = SelectItem<Value> & {
  selected: boolean;
  onSelect?: (value: Value) => void;
  style?: CSSProperties;
  /** Checked checkbox fill (`accent-color`). Defaults to the theme UI accent. */
  accentColor?: string;
};

/**
 * Renders a checkbox row in a multi-select dropdown list.
 *
 * @param props - Row properties, including value, selection state, and optional
 *   checkbox accent color.
 * @returns Multi-select list item element.
 * @internal
 */
export function MultiSelectItem<Value = unknown>(props: MultiSelectItemProps<Value>) {
  const { themeSettings } = useThemeContext();
  const { value, displayValue, selected, onSelect, accentColor } = props;

  const handleToggle = () => onSelect?.(value);

  return (
    <SelectItemContainer
      theme={themeSettings}
      style={{ height: '36px', paddingLeft: '8px' }}
      onClick={handleToggle}
    >
      <Checkbox
        checked={selected}
        onChange={handleToggle}
        style={{
          width: '13px',
          height: '13px',
          marginRight: '12px',
          ...(accentColor ? { accentColor } : null),
        }}
        labelProps={{ onClick: (e) => e.stopPropagation() }}
      />
      <DropdownSelectLabel theme={themeSettings}>{displayValue ?? `${value}`}</DropdownSelectLabel>
    </SelectItemContainer>
  );
}
