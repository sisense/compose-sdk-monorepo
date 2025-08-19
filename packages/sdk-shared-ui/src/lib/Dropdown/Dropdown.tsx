import classNames from 'classnames';
import React, { forwardRef } from 'react';

import { styleguideConstants } from '../constants/styleguideConstants';
import type { MenuItemConfig, ScrollbarProps } from '../Menu';
import { itemTypes, Menu } from '../Menu';
// import { SLF } from '@sbi/styleguide';
import { Popover } from '../Popover';
import style from './Dropdown.module.scss';
import { DropdownButton } from './DropdownButton';
import { useDropdown } from './hooks';
import type { DropdownInputProps, DropdownItem } from './types';

const noop = () => {};

export type DropdownProps = {
  bubblePopoverMouseEvents?: boolean;
  classNameButton?: string;
  classNameDropdown?: string;
  classNameSearch?: string;
  classNameMenu?: string;
  classNameTooltip?: string;
  disabled?: boolean;
  items: DropdownItem[];
  mask?: boolean;
  onSelectItem?: (item: MenuItemConfig) => void;
  popoverOverlayLevel?: number;
  selectedItemId?: string;
  selectedShowIcon?: boolean;
  width?: number;
  inlineVariant?: boolean;
  scrollbarProps?: ScrollbarProps;
  placeholder?: string;
  placement?: string;
  zIndex?: number;
  searchInputProps?: DropdownInputProps;
  open?: boolean;
  isLoading?: boolean;
};

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      bubblePopoverMouseEvents = false,
      items = [],
      onSelectItem = noop,
      popoverOverlayLevel = 0,
      selectedShowIcon = true,
      mask = true,
      placeholder = '',
      placement = 'bottomLeft',
      disabled = false,
      selectedItemId,
      width,
      scrollbarProps,
      classNameMenu,
      inlineVariant,
      classNameDropdown,
      classNameButton,
      classNameSearch,
      classNameTooltip,
      zIndex,
      searchInputProps,
      open = false,
      isLoading = false,
    },
    ref,
  ) => {
    const popoverVerticalOffset = inlineVariant ? 12 : 0;
    const menuItems = items.map((item) => ({
      id: item.id,
      caption: item.caption || item.id,
      type: itemTypes.ITEM,
      iconName: item.iconName,
      iconClass: item.iconClass,
      selected: item.id === selectedItemId,
      tooltip: item.tooltip,
      disabled: item.disabled,
    }));

    const {
      isOpen,
      handlers: { handleOnSelectItem, handleDropdownClick },
    } = useDropdown(onSelectItem, open, disabled);

    const renderDropdown = () => {
      const menuClassNames = classNames(
        style.menu,
        // SLF.BACK,
        // SLF.TEXT_PRIMARY,
        styleguideConstants.SISENSE_NAMESPACE,
        classNameMenu,
      );

      return (
        <Menu
          items={menuItems}
          onItemSelected={handleOnSelectItem}
          className={menuClassNames}
          width={width}
          scrollbarProps={scrollbarProps}
          isLoading={isLoading}
          classNameTooltip={classNameTooltip}
        />
      );
    };

    return (
      <div ref={ref} data-testid="popover_container">
        <Popover
          zIndex={zIndex}
          bubbleMouseEvents={bubblePopoverMouseEvents}
          trigger={['click']}
          visible={isOpen}
          placement={placement}
          overlay={renderDropdown}
          level={popoverOverlayLevel}
          onVisibleChange={handleDropdownClick}
          onRequestClose={handleDropdownClick}
          align={{ offset: [0, popoverVerticalOffset] }}
          mask={mask}
        >
          <div>
            <DropdownButton
              isOpen={isOpen}
              items={items}
              selectedShowIcon={selectedShowIcon}
              placeholder={placeholder}
              width={width}
              disabled={disabled}
              classNameButton={classNameButton}
              classNameDropdown={classNameDropdown}
              classNameSearch={classNameSearch}
              inlineVariant={inlineVariant}
              searchInputProps={searchInputProps}
              selectedItemId={selectedItemId}
            />
          </div>
        </Popover>
      </div>
    );
  },
);

export default Dropdown;
export { Dropdown };
