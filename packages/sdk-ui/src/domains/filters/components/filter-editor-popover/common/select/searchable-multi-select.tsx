import React, { CSSProperties, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ClickAwayListener from '@mui/material/ClickAwayListener';

import {
  ScrollWrapper,
  ScrollWrapperOnScrollEvent,
} from '@/domains/filters/components/filter-editor-popover/common/scroll-wrapper';
import { StyledSearchInput } from '@/domains/filters/components/filter-editor-popover/common/select/searchable-single-select';
import { SmallLoader } from '@/domains/filters/components/filter-editor-popover/common/small-loader';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Popper } from '@/shared/components/popper';
import { DEFAULT_TEXT_COLOR } from '@/shared/const';

import { ArrowDownIcon } from '../../../icons';
import { SelectField, SelectLabel } from './base';
import { MultiSelectItem } from './multi-select-item';
import {
  SearchableSelectContent,
  SearchableSelectContentList,
  SearchableSelectContentToolbar,
  SearchableSelectContentToolbarButton,
  SearchableSelectContentToolbarButtonWithTooltip,
} from './searchable-select-content';
import { SelectItem } from './types';
import { getSelectedItemsDisplayValue } from './utils';

type SearchableMultiSelectProps<Value> = {
  values?: Value[];
  items: SelectItem<Value>[];
  width?: number | string;
  placeholder?: string;
  onChange?: (values: Value[]) => void;
  onListScroll?: (event: ScrollWrapperOnScrollEvent) => void;
  showListLoader?: boolean;
  showSearch?: boolean;
  onSearchUpdate?: (searchValue: string) => void;
  /** Applies inline styles to the select trigger. */
  fieldStyle?: CSSProperties;
  /** Sets the trigger-label color when no values are selected. */
  placeholderColor?: string;
  /**
   * Whether every item of the underlying list has been loaded. While `false`, `Select All`
   * is disabled, since it could only reach the items paged in so far. Defaults to `true`.
   */
  allItemsLoaded?: boolean;
};

/** @internal */
export function SearchableMultiSelect<Value = unknown>(props: SearchableMultiSelectProps<Value>) {
  const {
    items,
    placeholder,
    onChange,
    onListScroll,
    showListLoader = false,
    showSearch = true,
    onSearchUpdate,
    width,
    fieldStyle,
    placeholderColor,
    allItemsLoaded = true,
  } = props;
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
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

  const isSelectAllBlockedByPaging = !allItemsLoaded;
  const isSelectAllDisabled = isSelectAllBlockedByPaging || items.length === values.length;

  const onClose = useCallback(() => {
    setOpen(false);
    onSearchUpdate?.('');
  }, [onSearchUpdate]);

  const onContainerClick = useCallback(() => {
    if (open) {
      onClose();
    } else {
      setOpen(true);
    }
  }, [open, onClose]);

  const triggerTitle = useMemo(
    () =>
      values.length > 0
        ? items
            .filter((item) => values.includes(item.value))
            .map((item) => String(item.displayValue ?? item.value))
            .join(', ')
        : undefined,
    [items, values],
  );

  return (
    <ClickAwayListener onClickAway={onClose}>
      <div style={{ width }}>
        <div style={{ position: 'relative' }}>
          <SelectField
            ref={selectElementRef}
            focus={open}
            onClick={onContainerClick}
            theme={themeSettings}
            title={triggerTitle}
            aria-label="Searchable multi-select"
            style={fieldStyle}
          >
            <SelectLabel
              theme={themeSettings}
              style={
                values.length
                  ? undefined
                  : placeholderColor
                  ? { color: placeholderColor }
                  : { opacity: '50%' }
              }
              aria-label="Value"
            >
              {getSelectedItemsDisplayValue(items, values) ?? placeholder}
            </SelectLabel>
            <ArrowDownIcon
              fill={themeSettings.general.popover.input.textColor || DEFAULT_TEXT_COLOR}
              aria-label="Open icon"
              style={{
                minWidth: '24px',
                transform: `rotate(${open ? 180 : 0}deg)`,
              }}
            />
          </SelectField>
          {showSearch && open && (
            <StyledSearchInput
              inputRef={(input) => input?.focus()}
              theme={themeSettings}
              placeholder={t('filterEditor.placeholders.enterValue')}
              onChange={(e) => {
                onSearchUpdate?.(e.target.value);
              }}
              aria-label="Value input"
            />
          )}
        </div>
        <Popper
          open={open}
          anchorEl={selectElementRef.current}
          style={{ maxHeight: 300 }}
          preventClickPropagation={true}
        >
          <SearchableSelectContent
            theme={themeSettings}
            style={{
              minWidth: selectElementRef.current?.clientWidth,
              maxWidth:
                selectElementRef.current?.clientWidth && selectElementRef.current?.clientWidth * 2,
            }}
            data-testid="csdk-searchable-multi-select-content"
            aria-label="Searchable multi-select content"
          >
            <SearchableSelectContentToolbar>
              <SearchableSelectContentToolbarButtonWithTooltip
                style={{ marginRight: '8px' }}
                disabled={isSelectAllDisabled}
                onClick={handleSelectAll}
                theme={themeSettings}
                tooltipTitle={t('filterEditor.tooltips.selectAllPartiallyLoaded')}
                disableTooltip={!isSelectAllBlockedByPaging}
              >
                {t('filterEditor.buttons.selectAll')}
              </SearchableSelectContentToolbarButtonWithTooltip>
              <SearchableSelectContentToolbarButton
                disabled={!values.length}
                onClick={handleClearAll}
                theme={themeSettings}
              >
                {t('filterEditor.buttons.clearAll')}
              </SearchableSelectContentToolbarButton>
            </SearchableSelectContentToolbar>
            <ScrollWrapper onScroll={onListScroll}>
              <SearchableSelectContentList aria-label="List" theme={themeSettings}>
                {items.map((item, index) => (
                  <MultiSelectItem
                    key={index}
                    {...item}
                    selected={!!values?.includes(item.value)}
                    onSelect={handleItemSelect}
                  />
                ))}
                {showListLoader && <SmallLoader />}
              </SearchableSelectContentList>
            </ScrollWrapper>
          </SearchableSelectContent>
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
