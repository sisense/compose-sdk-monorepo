import { CSSProperties, useCallback, useRef, useState } from 'react';

import styled from '@emotion/styled';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import { Popper } from '@/shared/components/popper';
import { DEFAULT_TEXT_COLOR } from '@/shared/const';

import { ArrowDownIcon } from '../../../icons/index.js';
import { SelectField, SelectIconContainer, SelectLabel } from './base.js';
import { SingleSelectItem } from './single-select-item.js';
import { SelectItem } from './types.js';

const SelectContainer = styled.div`
  box-sizing: border-box;
  display: inline-flex;
`;
const Content = styled.div<Themable>`
  background: ${({ theme }) => theme.general.popover.input.dropdownList.backgroundColor};
`;

type SingleSelectProps<Value> = {
  value?: Value;
  multiple?: boolean;
  items: SelectItem<Value>[];
  style?: CSSProperties;
  /** Applies inline styles to the select trigger. */
  fieldStyle?: CSSProperties;
  /** Applies inline styles to the open list panel (portaled, so not inherited from the trigger). */
  contentStyle?: CSSProperties;
  className?: string;
  onChange?: (value: Value) => void;
  /** Selected-item checkmark color (e.g. Filter Style `accentColor`). */
  primaryColor?: string;
  primaryBackgroundColor?: string;
};

/**
 * Renders a compact single-value dropdown used by FilterWidget date-level
 * selection and the filter editor.
 *
 * @param props - Single-select properties, including items, value, and Filter Style
 *   trigger / list / accent colors.
 * @returns Single-select dropdown element.
 * @internal
 */
export function SingleSelect<Value = unknown>(props: SingleSelectProps<Value>) {
  const {
    value,
    items,
    style,
    fieldStyle,
    contentStyle,
    className,
    onChange,
    primaryColor,
    ...rest
  } = props;

  const { themeSettings } = useThemeContext();
  const [open, setOpen] = useState(false);
  const selectElementRef = useRef<HTMLDivElement | null>(null);
  const selectedItem = items.find((item) => item.value === value);
  const textColor =
    typeof fieldStyle?.color === 'string'
      ? fieldStyle.color
      : themeSettings.general.popover.input.textColor || DEFAULT_TEXT_COLOR;

  const handleItemSelect = useCallback(
    (newValue: Value) => {
      if (newValue !== value) {
        onChange?.(newValue);
      }
      setOpen(false);
    },
    [value, onChange],
  );

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <SelectContainer className={className} style={style}>
        <SelectField
          theme={themeSettings}
          ref={selectElementRef}
          focus={open}
          onClick={() => setOpen((isOpen) => !isOpen)}
          style={fieldStyle}
          {...rest}
        >
          {selectedItem?.icon && <SelectIconContainer>{selectedItem?.icon}</SelectIconContainer>}
          <SelectLabel theme={themeSettings} aria-label="Value" style={{ color: textColor }}>
            <>{selectedItem?.displayValue ?? selectedItem?.value}</>
          </SelectLabel>
          <ArrowDownIcon
            aria-label="Select icon"
            fill={textColor}
            style={{
              minWidth: '24px',
              transform: `rotate(${open ? 180 : 0}deg)`,
            }}
          />
        </SelectField>
        <Popper
          open={open}
          anchorEl={selectElementRef.current}
          style={{
            borderRadius: contentStyle?.borderRadius ?? 4,
          }}
          preventClickPropagation={true}
        >
          <Content
            theme={themeSettings}
            style={{
              minWidth: selectElementRef.current?.clientWidth,
              maxWidth:
                selectElementRef.current?.clientWidth && selectElementRef.current?.clientWidth * 2,
              ...contentStyle,
            }}
            aria-label="Single-select content"
            data-testid="filter-widget-date-level-select-content"
          >
            {items.map((item, index) => (
              <SingleSelectItem
                key={index}
                {...item}
                selected={item.value === value}
                onSelect={handleItemSelect}
                style={primaryColor ? { color: primaryColor } : undefined}
              />
            ))}
          </Content>
        </Popper>
      </SelectContainer>
    </ClickAwayListener>
  );
}
