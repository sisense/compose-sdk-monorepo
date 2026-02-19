import { CSSProperties, useCallback, useRef, useState } from 'react';

import ClickAwayListener from '@mui/material/ClickAwayListener';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';
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
  className?: string;
  onChange?: (value: Value) => void;
  primaryColor?: string;
  primaryBackgroundColor?: string;
};

/** @internal */
export function SingleSelect<Value = unknown>(props: SingleSelectProps<Value>) {
  const { value, items, style, className, onChange, ...rest } = props;

  const { themeSettings } = useThemeContext();
  const [open, setOpen] = useState(false);
  const selectElementRef = useRef<HTMLDivElement | null>(null);
  const selectedItem = items.find((item) => item.value === value);

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
          {...rest}
        >
          {selectedItem?.icon && <SelectIconContainer>{selectedItem?.icon}</SelectIconContainer>}
          <SelectLabel theme={themeSettings} aria-label="Value">
            <>{selectedItem?.displayValue ?? selectedItem?.value}</>
          </SelectLabel>
          <ArrowDownIcon
            aria-label="Select icon"
            fill={themeSettings.general.popover.input.textColor || DEFAULT_TEXT_COLOR}
            style={{
              minWidth: '24px',
              transform: `rotate(${open ? 180 : 0}deg)`,
            }}
          />
        </SelectField>
        <Popper open={open} anchorEl={selectElementRef.current} preventClickPropagation={true}>
          <Content
            theme={themeSettings}
            style={{
              minWidth: selectElementRef.current?.clientWidth,
              maxWidth:
                selectElementRef.current?.clientWidth && selectElementRef.current?.clientWidth * 2,
            }}
            aria-label="Single-select content"
          >
            {items.map((item, index) => (
              <SingleSelectItem
                key={index}
                {...item}
                selected={item.value === value}
                onSelect={handleItemSelect}
              />
            ))}
          </Content>
        </Popper>
      </SelectContainer>
    </ClickAwayListener>
  );
}
