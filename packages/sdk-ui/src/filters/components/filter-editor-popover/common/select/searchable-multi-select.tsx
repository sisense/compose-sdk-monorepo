import { CSSProperties, useCallback, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { ArrowDownIcon } from '../../../icons';
import { Popover } from '@/common/components/popover';
import { SelectItem } from './types';
import { SelectContainer, SelectLabel } from './base';
import { calculatePopoverPosition, getSelectedItemsDisplayValue } from './utils';
import { MultiSelectItem } from './multi-select-item';
import { useTranslation } from 'react-i18next';

const ContentToolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
  border-bottom: 1px solid #e7e8ea;
  margin: 0 10px 0 10px;
  height: 32px;
`;

const ContentToolbarButton = styled.button`
  font-family: 'Open Sans', sans-serif;
  border: none;
  background: none;
  color: #1eaff3;
  padding: 0;
  font-size: 11px;
  &:disabled {
    opacity: 0.4;
  }
`;

type SearchableMultiSelectProps<Value> = {
  values?: Value[];
  items: SelectItem<Value>[];
  style?: CSSProperties;
  placeholder?: string;
  onChange?: (values: Value[]) => void;
};

/** @internal */
export function SearchableMultiSelect<Value = unknown>(props: SearchableMultiSelectProps<Value>) {
  const { items, style, placeholder, onChange, ...rest } = props;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const selectElementRef = useRef<HTMLDivElement | null>(null);

  const values = useMemo(() => props.values || [], [props.values]);

  const handleItemSelect = useCallback(
    (newValue: Value) => {
      const isAlreadySelected = values.includes(newValue);

      if (isAlreadySelected) {
        onChange?.(values.filter((value) => value !== newValue));
      } else {
        onChange?.([...values, newValue]);
      }
    },
    [values, onChange],
  );

  const handleSelectAll = useCallback(() => {
    onChange?.(items.map(({ value }) => value));
  }, [items, onChange]);

  const handleClearAll = useCallback(() => {
    onChange?.([]);
  }, [onChange]);

  return (
    <>
      <SelectContainer
        ref={selectElementRef}
        focus={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        style={style}
        {...rest}
      >
        <SelectLabel style={{ opacity: values.length ? '100%' : '50%' }}>
          {getSelectedItemsDisplayValue(items, values) ?? placeholder}
        </SelectLabel>
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
        position={calculatePopoverPosition(selectElementRef.current, 10 * 20)}
      >
        <div
          style={{
            minWidth: selectElementRef.current?.clientWidth,
            maxWidth:
              selectElementRef.current?.clientWidth && selectElementRef.current?.clientWidth * 2,
          }}
        >
          <ContentToolbar>
            <ContentToolbarButton
              style={{ marginRight: '8px' }}
              disabled={items.length === values.length}
              onClick={handleSelectAll}
            >
              {t('filterEditor.buttons.selectAll')}
            </ContentToolbarButton>
            <ContentToolbarButton disabled={!values.length} onClick={handleClearAll}>
              {t('filterEditor.buttons.clearAll')}
            </ContentToolbarButton>
          </ContentToolbar>
          {items.map((item, index) => (
            <MultiSelectItem
              key={index}
              {...item}
              selected={!!values?.includes(item.value)}
              onSelect={handleItemSelect}
            />
          ))}
        </div>
      </Popover>
    </>
  );
}
