import { useCallback, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import type {
  Member,
  SelectedMember,
} from '@/domains/filters/components/member-filter-tile/members-reducer';
import {
  getSelectionListMembershipAfterToggle,
  isMemberVisuallySelected,
} from '@/domains/filters/shared/members-filter-selection';

import { Dropdown } from './dropdown';
import type { DropdownItem, DropdownScrollEvent } from './dropdown';
import type { FieldOwnProps } from './field';
import { Selector } from './selector';
import { useFieldId } from './use-field-id';
import { useTriggerLabel } from './use-trigger-label';

/** @internal */
export type FilterSelectProps = FieldOwnProps & {
  members: Member[];
  selectedMembers: SelectedMember[];
  excludeMembers: boolean;
  enableMultiSelection: boolean;
  isMembersLoading?: boolean;
  /** Current server-side search term. */
  searchValue?: string;
  onSearchValueChange?: (searchValue: string) => void;
  /** When false the list still renders, but search updates are not forwarded. */
  showSearch?: boolean;
  onSelectMember: (member: Member, isSelected: boolean) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  /** Fires as the list scrolls, so the owner can page the next members in. */
  onListScroll?: (event: DropdownScrollEvent) => void;
  placeholder?: string;
  /**
   * Total from the members query row-count, reflecting the parent and search filters.
   * Drives the select-all trigger label, and must not be `members.length`: a
   * partially-loaded list would then wrongly read as complete.
   */
  totalMembersCount?: number;
  maxHeight?: number;
  id?: string;
};

/* The Selector owns its own width and anchors the dropdown itself; this wrapper only
   exists to scope the keydown handler. */
const Root = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 100%;
`;

/**
 * The flat members control — a `Selector` wired to its `Dropdown`, shown as one control.
 *
 * Presentational: the widget above it still owns fetching, paging and the filter, so
 * search is server-side (there is deliberately no client-side filtering of `members`)
 * and every selection change goes back out through the callbacks, which route through
 * the selection state machine. Immediate-apply, as today — a flat list has nothing to
 * abandon, so it needs no footer.
 * @param props - The member page, the current selection, and the callbacks that mutate it
 * @returns The trigger and its option list
 * @internal
 */
export function FilterSelect({
  members,
  selectedMembers,
  excludeMembers,
  enableMultiSelection,
  isMembersLoading = false,
  searchValue = '',
  onSearchValueChange,
  showSearch = true,
  onSelectMember,
  onSelectAll,
  onClearAll,
  onListScroll,
  placeholder,
  totalMembersCount,
  maxHeight = 240,
  id,
  label,
  error,
  disabled,
  state,
  size,
  radius,
  width,
  controlStyle,
  className,
}: FilterSelectProps) {
  const { t } = useTranslation();
  const fieldId = useFieldId(id);
  const listboxId = `${fieldId}-listbox`;
  const [isOpen, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setActiveId(null);
    onSearchValueChange?.('');
  }, [onSearchValueChange]);

  const selectedKeys = useMemo(
    () => new Set(selectedMembers.map((member) => member.key)),
    [selectedMembers],
  );

  const items = useMemo<DropdownItem[]>(
    () => members.map((member) => ({ id: member.key, label: member.title })),
    [members],
  );

  const visuallySelected = useMemo(
    () =>
      members
        .filter((member) => isMemberVisuallySelected(member.key, selectedKeys, excludeMembers))
        .map((member) => member.key),
    [members, selectedKeys, excludeMembers],
  );

  const {
    label: triggerLabel,
    names,
    isPlaceholderShown,
  } = useTriggerLabel(selectedMembers, excludeMembers, totalMembersCount, placeholder);

  const selectMember = useCallback(
    (memberKey: string) => {
      const member = members.find((candidate) => candidate.key === memberKey);
      if (!member || disabled) {
        return;
      }

      if (!enableMultiSelection) {
        onSelectMember(member, true);
        close();
        return;
      }

      // `isSelected` means "in the selection list" — inclusions or exclusions.
      onSelectMember(
        member,
        getSelectionListMembershipAfterToggle(member.key, selectedKeys, excludeMembers),
      );
    },
    [members, disabled, enableMultiSelection, onSelectMember, close, selectedKeys, excludeMembers],
  );

  // Resolved against the latest highlight rather than the render's copy, so two
  // keypresses in one tick advance two rows instead of landing on the same one.
  const moveActive = (direction: 1 | -1) => {
    if (items.length === 0) {
      return;
    }
    setActiveId((current) => {
      const index = items.findIndex((item) => item.id === current);
      const next = index === -1 ? (direction === 1 ? 0 : items.length - 1) : index + direction;
      return items[(next + items.length) % items.length]?.id ?? null;
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        setOpen(true);
      } else {
        moveActive(event.key === 'ArrowDown' ? 1 : -1);
      }
    } else if (event.key === 'Enter' && isOpen && activeId) {
      event.preventDefault();
      selectMember(activeId);
    } else if (event.key === 'Tab' && isOpen) {
      close();
    }
  };

  return (
    <Root className={className} onKeyDown={onKeyDown} data-testid="members-filter-select">
      <Selector
        id={fieldId}
        label={label}
        error={error}
        disabled={disabled}
        state={state}
        size={size}
        radius={radius}
        width={width}
        controlStyle={controlStyle}
        value={isPlaceholderShown ? undefined : triggerLabel}
        names={names}
        placeholder={placeholder ?? t('filterWidget.placeholders.setFilter')}
        searchable={showSearch}
        search={searchValue}
        /* Search is server-side, so the rows are replaced wholesale. Dropping the highlight
           keeps `aria-activedescendant` from naming a row that no longer exists. */
        onSearchChange={
          showSearch
            ? (next) => {
                setActiveId(null);
                onSearchValueChange?.(next);
              }
            : undefined
        }
        open={isOpen}
        onOpenChange={(next) => (next ? setOpen(true) : close())}
        onClear={onClearAll}
        listboxId={listboxId}
        activeOptionId={activeId ? `${listboxId}-${activeId}` : undefined}
        popover={
          isOpen ? (
            <Dropdown
              id={listboxId}
              mode={enableMultiSelection ? 'multi' : 'single'}
              radius={radius}
              items={items}
              selected={visuallySelected}
              onSelect={selectMember}
              activeId={activeId ?? undefined}
              onSelectAll={onSelectAll}
              onClearAll={onClearAll}
              selectAllDisabled={disabled || (excludeMembers && selectedMembers.length === 0)}
              clearAllDisabled={disabled || (!excludeMembers && selectedMembers.length === 0)}
              onScroll={onListScroll}
              loading={isMembersLoading}
              maxHeight={maxHeight}
            />
          ) : null
        }
      />
    </Root>
  );
}
