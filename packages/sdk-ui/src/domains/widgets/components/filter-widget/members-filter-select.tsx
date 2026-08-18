import {
  CSSProperties,
  FunctionComponent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import ClickAwayListener from '@mui/material/ClickAwayListener';

import {
  ScrollWrapper,
  ScrollWrapperOnScrollEvent,
} from '@/domains/filters/components/filter-editor-popover/common/scroll-wrapper';
import {
  SelectField,
  SelectLabel,
} from '@/domains/filters/components/filter-editor-popover/common/select/base';
import { MultiSelectItem } from '@/domains/filters/components/filter-editor-popover/common/select/multi-select-item';
import {
  SearchableSelectContent,
  SearchableSelectContentList,
  SearchableSelectContentToolbar,
  SearchableSelectContentToolbarButton,
} from '@/domains/filters/components/filter-editor-popover/common/select/searchable-select-content';
import { StyledSearchInput } from '@/domains/filters/components/filter-editor-popover/common/select/searchable-single-select';
import { SingleSelectItem } from '@/domains/filters/components/filter-editor-popover/common/select/single-select-item';
import { SmallLoader } from '@/domains/filters/components/filter-editor-popover/common/small-loader';
import { ArrowDownIcon } from '@/domains/filters/components/icons';
import type {
  Member,
  SelectedMember,
} from '@/domains/filters/components/member-filter-tile/members-reducer';
import {
  getSelectionListMembershipAfterToggle,
  isMemberVisuallySelected,
} from '@/domains/filters/shared/members-filter-selection';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Popper } from '@/shared/components/popper';
import { DEFAULT_TEXT_COLOR } from '@/shared/const';

type MembersFilterSelectProps = {
  members: Member[];
  selectedMembers: SelectedMember[];
  excludeMembers: boolean;
  enableMultiSelection: boolean;
  isMembersLoading?: boolean;
  searchValue?: string;
  onSearchValueChange?: (searchValue: string) => void;
  /** When false, the list still renders but search updates are not forwarded (e.g. date levels). */
  showSearch?: boolean;
  onSelectMember: (member: Member, isSelected: boolean) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onListScroll?: (event: ScrollWrapperOnScrollEvent) => void;
  placeholder?: string;
  placeholderColor?: string;
  width?: number | string;
  fieldStyle?: CSSProperties;
  disabled?: boolean;
  /**
   * Total count from the members query row-count (reflects parent/search filters).
   * Used for the closed trigger label in select-all state (`"N selected"`).
   */
  totalMembersCount?: number;
};

/** Same cap as filter-editor `getSelectedItemsDisplayValue`. */
const MAX_DISPLAY_ITEMS = 3;

/**
 * Builds the closed-trigger label for a unified members selection.
 *
 * - Select-all (`excludeMembers` + empty list) → `"N selected"` when total is known,
 * else include-all
 * - Exclude mode with exclusions → remaining count (`total - exclusions`) when total
 * is known; otherwise `"All except N"` (never `"N selected"` — that would mislabel
 * exclusions as selected)
 * - Empty include → placeholder
 * - Include mode → up to three titles, else `"N selected"`
 * @param selectedMembers - Current selected / excluded members
 * @param excludeMembers - Whether the list is in exclude mode
 * @param placeholder - Placeholder when nothing is selected in include mode
 * @param includeAllLabel - Fallback label for the select-all state
 * @param formatSelectedCount - Localized `"N selected"` formatter
 * @param formatAllExceptCount - Localized `"All except N"` formatter (exclude mode, no total)
 * @param totalMembersCount - Optional members-query total (pre-pagination; may reflect search)
 * @returns Trigger display string
 * @internal
 */
export function getMembersFilterSelectTriggerLabel(
  selectedMembers: readonly SelectedMember[],
  excludeMembers: boolean,
  placeholder: string,
  includeAllLabel: string,
  formatSelectedCount: (count: number) => string,
  formatAllExceptCount: (count: number) => string,
  totalMembersCount?: number,
): string {
  if (excludeMembers) {
    // Exclusions are the blacklist — never surface their titles as the selection.
    if (typeof totalMembersCount === 'number') {
      return formatSelectedCount(Math.max(0, totalMembersCount - selectedMembers.length));
    }
    return selectedMembers.length === 0
      ? includeAllLabel
      : formatAllExceptCount(selectedMembers.length);
  }

  if (selectedMembers.length === 0) {
    return placeholder;
  }
  if (selectedMembers.length > MAX_DISPLAY_ITEMS) {
    return formatSelectedCount(selectedMembers.length);
  }
  return selectedMembers.map((member) => member.title).join(', ');
}

/**
 * Compact dropdown for FilterWidget members selection. Matches the filter-editor
 * `SearchableMultiSelect` look (search overlay, Select All / Clear All,
 * MultiSelectItem rows) while wiring select-all / explicit / exclude through the
 * FilterWidget inverted selection callbacks.
 * @internal
 */
export const MembersFilterSelect: FunctionComponent<MembersFilterSelectProps> = ({
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
  placeholderColor,
  width = '100%',
  fieldStyle,
  disabled = false,
  totalMembersCount,
}) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const [open, setOpen] = useState(false);
  const selectElementRef = useRef<HTMLDivElement | null>(null);

  const resolvedPlaceholder = placeholder ?? t('filterWidget.placeholders.setFilter');
  const includeAllLabel = t('includeAll');
  const formatSelectedCount = useCallback(
    (count: number) => t('filterWidget.selectedCount', { count }),
    [t],
  );
  const formatAllExceptCount = useCallback(
    (count: number) => t('filterWidget.allExceptCount', { count }),
    [t],
  );

  const triggerLabel = useMemo(
    () =>
      getMembersFilterSelectTriggerLabel(
        selectedMembers,
        excludeMembers,
        resolvedPlaceholder,
        includeAllLabel,
        formatSelectedCount,
        formatAllExceptCount,
        totalMembersCount,
      ),
    [
      selectedMembers,
      excludeMembers,
      resolvedPlaceholder,
      includeAllLabel,
      formatSelectedCount,
      formatAllExceptCount,
      totalMembersCount,
    ],
  );

  const selectedKeys = useMemo(
    () => new Set(selectedMembers.map((member) => member.key)),
    [selectedMembers],
  );

  const isPlaceholderShown = selectedMembers.length === 0 && !excludeMembers;
  // Select-all = empty exclusions; clear = empty inclusions.
  const isSelectAllActive = excludeMembers && selectedMembers.length === 0;
  const isCleared = !excludeMembers && selectedMembers.length === 0;

  const onClose = useCallback(() => {
    setOpen(false);
    onSearchValueChange?.('');
  }, [onSearchValueChange]);

  const onContainerClick = useCallback(() => {
    if (disabled) {
      return;
    }
    if (open) {
      onClose();
    } else {
      setOpen(true);
    }
  }, [disabled, open, onClose]);

  const onTriggerKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onContainerClick();
      }
    },
    [disabled, onContainerClick],
  );

  const handleMemberClick = useCallback(
    (member: Member) => {
      if (disabled) {
        return;
      }
      if (!enableMultiSelection) {
        onSelectMember(member, true);
        setOpen(false);
        onSearchValueChange?.('');
        return;
      }

      const nextInSelectionList = getSelectionListMembershipAfterToggle(
        member.key,
        selectedKeys,
        excludeMembers,
      );
      // `isSelected` means "in the selection list" (inclusions or exclusions).
      onSelectMember(member, nextInSelectionList);
    },
    [
      disabled,
      enableMultiSelection,
      excludeMembers,
      onSelectMember,
      onSearchValueChange,
      selectedKeys,
    ],
  );

  const handleSelectAllClick = useCallback(
    (event: ReactMouseEvent) => {
      event.stopPropagation();
      onSelectAll();
    },
    [onSelectAll],
  );

  const handleClearAllClick = useCallback(
    (event: ReactMouseEvent) => {
      event.stopPropagation();
      onClearAll();
    },
    [onClearAll],
  );

  return (
    <ClickAwayListener onClickAway={onClose}>
      <div style={{ width }} data-testid="members-filter-select">
        <div style={{ position: 'relative' }}>
          <SelectField
            ref={selectElementRef}
            focus={open}
            onClick={onContainerClick}
            onKeyDown={onTriggerKeyDown}
            theme={themeSettings}
            title={triggerLabel}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-disabled={disabled || undefined}
            aria-label="Members filter select"
            style={fieldStyle}
          >
            <SelectLabel
              theme={themeSettings}
              style={
                isPlaceholderShown
                  ? placeholderColor
                    ? { color: placeholderColor }
                    : { opacity: '50%' }
                  : undefined
              }
              aria-label="Value"
            >
              {triggerLabel}
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
              value={searchValue}
              onChange={(e) => {
                onSearchValueChange?.(e.target.value);
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
          <ScrollWrapper onScroll={onListScroll}>
            <SearchableSelectContent
              theme={themeSettings}
              style={{
                minWidth: selectElementRef.current?.clientWidth,
                maxWidth:
                  selectElementRef.current?.clientWidth && selectElementRef.current.clientWidth * 2,
              }}
              data-testid="members-filter-select-content"
              aria-label="Members filter select content"
            >
              {enableMultiSelection && (
                <SearchableSelectContentToolbar>
                  <SearchableSelectContentToolbarButton
                    type="button"
                    data-testid="members-filter-select-all"
                    style={{ marginRight: '8px' }}
                    disabled={disabled || isSelectAllActive}
                    onClick={handleSelectAllClick}
                    theme={themeSettings}
                  >
                    {t('filterEditor.buttons.selectAll')}
                  </SearchableSelectContentToolbarButton>
                  <SearchableSelectContentToolbarButton
                    type="button"
                    data-testid="members-filter-clear-all"
                    disabled={disabled || isCleared}
                    onClick={handleClearAllClick}
                    theme={themeSettings}
                  >
                    {t('filterEditor.buttons.clearAll')}
                  </SearchableSelectContentToolbarButton>
                </SearchableSelectContentToolbar>
              )}
              <SearchableSelectContentList aria-label="List" theme={themeSettings}>
                {members.map((member) =>
                  enableMultiSelection ? (
                    <MultiSelectItem
                      key={member.key}
                      value={member.key}
                      displayValue={member.title}
                      selected={isMemberVisuallySelected(member.key, selectedKeys, excludeMembers)}
                      onSelect={() => handleMemberClick(member)}
                    />
                  ) : (
                    <SingleSelectItem
                      key={member.key}
                      value={member.key}
                      displayValue={member.title}
                      selected={selectedKeys.has(member.key)}
                      onSelect={() => handleMemberClick(member)}
                    />
                  ),
                )}
                {isMembersLoading && <SmallLoader />}
              </SearchableSelectContentList>
            </SearchableSelectContent>
          </ScrollWrapper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};
