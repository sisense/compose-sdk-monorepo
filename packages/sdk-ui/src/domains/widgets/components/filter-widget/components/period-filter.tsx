import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  Member,
  SelectedMember,
} from '@/domains/filters/components/member-filter-tile/members-reducer';
import {
  getSelectionListMembershipAfterToggle,
  isMemberVisuallySelected,
} from '@/domains/filters/shared/members-filter-selection';

import type { FieldRadius, FieldSize } from './design-tokens';
import { Dropdown } from './dropdown';
import type { DropdownItem, DropdownScrollEvent } from './dropdown';
import { FieldInput, SecondaryGlyph } from './field';
import type { FieldOwnProps } from './field';
import {
  Actions,
  ClearButton,
  Foot,
  Head,
  Panel,
  PrimaryButton,
  SearchRow,
  SecondaryButton,
} from './filter-widget-panel';
import { Icon } from './icons';
import { Selector } from './selector';
import { useFieldId } from './use-field-id';
import { useTriggerLabel } from './use-trigger-label';

/** @internal */
export type PeriodFilterProps = FieldOwnProps & {
  /** The date levels on offer, already translated and already filtered by the widget. */
  levelItems: DropdownItem[];
  /** The level currently being edited. */
  level: string;
  /** The current level's translated name, for the field and the value screen's title. */
  levelLabel: string;
  onLevelChange: (level: string) => void;

  members: Member[];
  selectedMembers: SelectedMember[];
  excludeMembers: boolean;
  enableMultiSelection: boolean;
  isMembersLoading?: boolean;
  searchValue?: string;
  onSearchValueChange?: (searchValue: string) => void;
  onSelectMember: (member: Member, isSelected: boolean) => void;
  onSelectAll: () => void;
  /** Empties the drafted members — the panel's `Clear`, which publishes nothing. */
  onClearAll: () => void;
  /**
   * Clears the filter outright, from the closed trigger's ✕.
   *
   * Separate from `onClearAll` because it is not a panel edit: there is no open panel and
   * so no `Apply` coming to commit it. It behaves like the flat control's ✕ and publishes
   * at once, which is the whole point of offering it on the closed control.
   */
  onClearFilter: () => void;
  onListScroll?: (event: DropdownScrollEvent) => void;
  totalMembersCount?: number;

  /** Publishes the buffered edits. */
  onApply: () => void;
  /** Abandons them. The owner holds the draft, so this only has to say "drop it". */
  onCancel: () => void;
  placeholder?: string;
  id?: string;
};

/** Which of the two fields a drill-in screen is editing. */
type Screen = 'fields' | 'level' | 'value';

/** The panel's controls are Small whatever the trigger is. */
const PANEL_SIZE: FieldSize = 's';

/** How tall a list gets before it scrolls — 5.6 of the 30px rows. */
const LIST_HEIGHT = 168;

/**
 * A date filter behind **one trigger**, whose panel holds the two fields the filter is
 * made of: the date level, and the value at that level.
 *
 * - **One surface.** Neither field opens a popover of its own; the panel swaps to the
 *   list, the list takes the whole panel, and picking returns.
 * - **Both fields drill in**, because each is one of two on the screen — where a lone
 *   list would simply *be* the panel.
 * - **A one-of returns you, a checklist keeps you.** The level is a one-of; the value is
 *   a checklist while multiselect is on.
 * - **Only `Apply` publishes.** Edits buffer in the owner's draft, and `Cancel` or a
 *   click outside abandons them. On a live dashboard every publish re-queries every
 *   widget, so a reader trying three levels and cancelling would otherwise fire a
 *   refresh storm. The panel is a transaction.
 * @param props - The level and its options, the member page, and the commit callbacks
 * @returns The trigger and its drill-in panel
 * @internal
 */
export function PeriodFilter({
  levelItems,
  level,
  levelLabel,
  onLevelChange,
  members,
  selectedMembers,
  excludeMembers,
  enableMultiSelection,
  isMembersLoading = false,
  searchValue = '',
  onSearchValueChange,
  onSelectMember,
  onSelectAll,
  onClearAll,
  onClearFilter,
  onListScroll,
  totalMembersCount,
  onApply,
  onCancel,
  placeholder,
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
}: PeriodFilterProps) {
  const { t } = useTranslation();
  const fieldId = useFieldId(id);
  const [isOpen, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>('fields');

  const panelRadius: FieldRadius = radius ?? 's';
  const {
    label: triggerLabel,
    names,
    isPlaceholderShown,
  } = useTriggerLabel(selectedMembers, excludeMembers, totalMembersCount, placeholder);

  const selectedKeys = useMemo(
    () => new Set(selectedMembers.map((member) => member.key)),
    [selectedMembers],
  );
  const visuallySelected = useMemo(
    () =>
      members
        .filter((member) => isMemberVisuallySelected(member.key, selectedKeys, excludeMembers))
        .map((member) => member.key),
    [members, selectedKeys, excludeMembers],
  );

  const back = () => {
    setScreen('fields');
    onSearchValueChange?.('');
  };

  const open = () => setOpen(true);

  const close = () => {
    setOpen(false);
    setScreen('fields');
    onSearchValueChange?.('');
  };

  const commit = () => {
    onApply();
    close();
  };

  const abandon = () => {
    onCancel();
    close();
  };

  const pickMember = (memberKey: string) => {
    const member = members.find((candidate) => candidate.key === memberKey);
    if (!member) {
      return;
    }
    if (!enableMultiSelection) {
      onSelectMember(member, true);
      back();
      return;
    }
    onSelectMember(
      member,
      getSelectionListMembershipAfterToggle(member.key, selectedKeys, excludeMembers),
    );
  };

  const footer = (
    <Foot>
      <ClearButton
        type="button"
        data-testid="filter-widget-panel-clear"
        $radius={panelRadius}
        onClick={() => {
          onClearAll();
          back();
        }}
      >
        {t('filterWidget.controls.clear')}
      </ClearButton>
      <Actions>
        <SecondaryButton
          type="button"
          data-testid="filter-widget-panel-cancel"
          $radius={panelRadius}
          onClick={abandon}
        >
          {t('filterEditor.buttons.cancel')}
        </SecondaryButton>
        <PrimaryButton
          type="button"
          data-testid="filter-widget-panel-apply"
          $radius={panelRadius}
          onClick={commit}
        >
          {t('filterEditor.buttons.apply')}
        </PrimaryButton>
      </Actions>
    </Foot>
  );

  /** Head, body, footer — the frame every drill-in screen shares. */
  const screenShell = (title: ReactNode, body: ReactNode) => (
    <>
      <Head type="button" data-testid="filter-widget-panel-back" onClick={back}>
        <Icon name="arrowLeft" box={12} />
        {title}
      </Head>
      {body}
      {footer}
    </>
  );

  /**
   * A field whose "opening" is a drill-in rather than a popover of its own.
   *
   * No label over it: the level field's own value *is* its label — it reads `Quarter` —
   * and a heading saying `Quarter` over it would say the same word twice. What each
   * field is for is answered by the screen it opens.
   */
  const drillField = (value: string | undefined, to: Screen, dataTestId: string) => (
    <Selector
      dataTestId={dataTestId}
      size={PANEL_SIZE}
      radius={radius}
      /* The panel's own fields take the same style as the trigger. They cannot inherit it:
         every Field publishes a complete palette on its own root, so an inner field with no
         style of its own resolves from the theme and shadows the variables it sits inside —
         which left a Filter Style background on the trigger but not on these. */
      controlStyle={controlStyle}
      width="100%"
      value={value}
      placeholder={t('filterWidget.controls.select')}
      searchable={false}
      clearable={false}
      /* Only an open request drills in. Ignoring `next` meant a close request — Escape, or a
         click outside the field — navigated into the screen instead of leaving it. */
      onOpenChange={(next) => {
        if (!next) {
          return;
        }
        setScreen(to);
        onSearchValueChange?.('');
      }}
    />
  );

  const levelScreen = () =>
    screenShell(
      t('filterWidget.controls.selectDateLevel'),
      <Dropdown
        mode="single"
        radius={radius}
        surface={false}
        width="100%"
        items={levelItems}
        selected={[level]}
        onSelect={(next) => {
          /* Changing the level empties the value: the concrete periods belong to the
             level that produced them — `Q3 2025` is not a month and cannot be carried
             into one — so they go with it rather than sitting in a field that no longer
             offers them. The owner's handler does the emptying. */
          if (next !== level) {
            onLevelChange(next);
          }
          back();
        }}
      />,
    );

  const valueScreen = () =>
    screenShell(
      t('filterWidget.controls.selectValues', { level: levelLabel }),
      <>
        <SearchRow>
          <SecondaryGlyph>
            <Icon name="search" />
          </SecondaryGlyph>
          <FieldInput
            type="text"
            autoComplete="off"
            data-testid="filter-widget-panel-search"
            value={searchValue}
            placeholder={t('filterWidget.controls.findInList')}
            onChange={(event) => onSearchValueChange?.(event.target.value)}
          />
        </SearchRow>
        <Dropdown
          mode={enableMultiSelection ? 'multi' : 'single'}
          radius={radius}
          surface={false}
          width="100%"
          items={members.map((member) => ({ id: member.key, label: member.title }))}
          selected={visuallySelected}
          onSelect={pickMember}
          onSelectAll={onSelectAll}
          onClearAll={onClearAll}
          selectAllDisabled={excludeMembers && selectedMembers.length === 0}
          clearAllDisabled={!excludeMembers && selectedMembers.length === 0}
          onScroll={onListScroll}
          loading={isMembersLoading}
          maxHeight={LIST_HEIGHT}
        />
      </>,
    );

  const panel = (
    <Panel $radius={panelRadius} data-testid="filter-widget-date-panel">
      {screen === 'level' ? (
        levelScreen()
      ) : screen === 'value' ? (
        valueScreen()
      ) : (
        <>
          {/* The level, then its value — top to bottom in the order they are decided,
              since the second cannot be answered before the first. */}
          {drillField(levelLabel, 'level', 'filter-widget-date-level-field')}
          {drillField(
            isPlaceholderShown ? undefined : triggerLabel,
            'value',
            'filter-widget-date-value-field',
          )}
          {footer}
        </>
      )}
    </Panel>
  );

  /* The panel rides in the Selector's own popover slot, so it sits inside the Field that
     publishes the palette and needs no provider of its own. */
  return (
    <Selector
      id={fieldId}
      label={label}
      error={error}
      disabled={disabled}
      state={state}
      /* The trigger — and only the trigger — follows the Size setting. */
      size={size}
      radius={radius}
      width={width}
      controlStyle={controlStyle}
      className={className}
      value={isPlaceholderShown ? undefined : triggerLabel}
      names={names}
      placeholder={placeholder ?? t('filterWidget.placeholders.setFilter')}
      title={triggerLabel}
      searchable={false}
      clearable={!isPlaceholderShown}
      onClear={onClearFilter}
      open={isOpen}
      /* A click outside abandons the edits, exactly as Cancel does. */
      onOpenChange={(next) => (next ? open() : abandon())}
      popover={isOpen ? panel : null}
    />
  );
}
