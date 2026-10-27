/**
 * The single-choice list a Condition-style panel drills into (operator, direction, date level).
 *
 * The rows of a `Dropdown` are not tab stops — the owning combobox normally drives them from its
 * own input. A drill-in replaces that input with the list, so this owns the keyboard: focus moves
 * into the list when it opens, the arrow keys move the highlighted row, and Enter picks it.
 * @internal
 */
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import type { FieldRadius } from './design-tokens';
import { Dropdown } from './dropdown';
import type { DropdownItem } from './dropdown';
import { useFieldId } from './use-field-id';

/** @internal */
export type DrillChoiceListProps = {
  items: DropdownItem[];
  /** Selected ids; the first one is where the highlight starts. */
  selected?: string[];
  radius?: FieldRadius;
  /** Accessible name of the list. */
  label?: string;
  emptyMessage?: React.ReactNode;
  onSelect: (id: string) => void;
};

/**
 * Finds the next row the highlight can land on, skipping disabled ones.
 * @param items - The rows in display order.
 * @param from - The index to move from; `-1` when nothing is highlighted yet.
 * @param step - `1` for down, `-1` for up.
 * @returns The id of the next enabled row, or `undefined` when there is none in that direction.
 */
function nextEnabledId(items: DropdownItem[], from: number, step: 1 | -1): string | undefined {
  for (let index = from + step; index >= 0 && index < items.length; index += step) {
    if (!items[index].disabled) {
      return items[index].id;
    }
  }
  return undefined;
}

/**
 * Renders the list with its own keyboard handling.
 * @param props - The rows, the selection, and the pick callback.
 * @returns The focusable list.
 * @internal
 */
export function DrillChoiceList(props: DrillChoiceListProps) {
  const { items, selected = [], radius, label, emptyMessage, onSelect } = props;
  const listId = useFieldId();
  const frame = useRef<HTMLDivElement>(null);
  const [highlighted, setActiveId] = useState<string | undefined>(
    () =>
      selected.find((id) => items.some((item) => item.id === id)) ?? nextEnabledId(items, -1, 1),
  );
  /* A search can drop the highlighted row from the list; the first row stands in until a key moves it. */
  const activeId = items.some((item) => item.id === highlighted)
    ? highlighted
    : nextEnabledId(items, -1, 1);

  /* The trigger that opened this list unmounts with the value screen, so focus would fall to the
     page. Taking it here is what lets the keys below reach the list at all. */
  useEffect(() => {
    frame.current?.focus();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = items.findIndex((item) => item.id === activeId);
    const move = (next: string | undefined) => {
      event.preventDefault();
      if (next !== undefined) setActiveId(next);
    };
    switch (event.key) {
      case 'ArrowDown':
        return move(nextEnabledId(items, at, 1));
      case 'ArrowUp':
        return move(at < 0 ? undefined : nextEnabledId(items, at, -1));
      case 'Home':
        return move(nextEnabledId(items, -1, 1));
      case 'End':
        return move(nextEnabledId(items, items.length, -1));
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeId !== undefined) onSelect(activeId);
        return undefined;
      default:
        return undefined;
    }
  };

  return (
    <div
      ref={frame}
      tabIndex={-1}
      role="group"
      aria-label={label}
      aria-activedescendant={activeId === undefined ? undefined : `${listId}-${activeId}`}
      onKeyDown={onKeyDown}
      style={{ outline: 'none' }}
    >
      <Dropdown
        id={listId}
        mode="single"
        radius={radius}
        surface={false}
        width="100%"
        items={items}
        selected={selected}
        activeId={activeId}
        onSelect={onSelect}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
