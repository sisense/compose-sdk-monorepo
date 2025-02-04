import { PopoverAnchorPosition } from '@/common/components/popover';
import { SelectItem } from './types';

export const calculatePopoverPosition = (
  anchorEl: HTMLDivElement | null,
  contentHeight?: number,
): PopoverAnchorPosition => {
  const positionBottom: PopoverAnchorPosition = {
    anchorEl: anchorEl as HTMLElement,
    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
    contentOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
  };
  const positionTop: PopoverAnchorPosition = {
    anchorEl: anchorEl as HTMLElement,
    anchorOrigin: { vertical: 'top', horizontal: 'left' },
    contentOrigin: {
      vertical: 'bottom',
      horizontal: 'left',
    },
  };

  if (!anchorEl || !contentHeight) {
    return positionBottom;
  }

  const shouldPlaceOnBottom =
    window.innerHeight - anchorEl.getBoundingClientRect().bottom > contentHeight;

  return shouldPlaceOnBottom ? positionBottom : positionTop;
};

const MAX_DISPLAY_ITEMS = 3;

export function getSelectedItemsDisplayValue<Value>(
  items: SelectItem<Value>[],
  values: Value[],
): string | undefined {
  if (values.length === 0) {
    return undefined;
  }

  if (values.length > MAX_DISPLAY_ITEMS) {
    return `${values.length} selected`;
  }

  return items
    .filter((item) => values.includes(item.value))
    .map(({ value, displayValue }) => displayValue ?? value)
    .join(', ');
}
