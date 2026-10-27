/**
 * Shared panel shell for ConditionFilterText / ConditionFilterNumeric —
 * trigger Selector, drill-in lists, Clear · Cancel · Apply.
 *
 * Domain draft / validation / value fields stay in each control; only the chrome
 * is shared so shell bugs are fixed once.
 * @internal
 */
import { useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { RemoveButton } from './condition-filter-layout.js';
import type { FieldRadius, FieldSize } from './design-tokens';
import { DrillChoiceList } from './drill-choice-list.js';
import type { DropdownItem } from './dropdown';
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
} from './filter-widget-panel.js';
import { Icon } from './icons';
import { Selector } from './selector';
import { useFieldId } from './use-field-id';

/** Drill-in navigation inside the Condition panel. @internal */
export type ConditionFilterScreen =
  | { kind: 'value' }
  | { kind: 'operator' }
  | { kind: 'connector' }
  | { kind: 'chainOp'; rowId: string }
  | { kind: 'grain' };

/** Operator / connector rows inside the panel use a compact field size. @internal */
export const CONDITION_PANEL_SIZE: FieldSize = 's';

const SEARCH_THRESHOLD = 8;

/** ✕ that removes a primary or chained condition row. @internal */
export function ConditionRemoveControl({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <RemoveButton
      type="button"
      data-testid="filter-widget-condition-remove"
      aria-label={t('filterWidget.controls.clearSelection')}
      /* Without this, a mousedown here blurs whichever field currently has focus
         first (even a different row's), collapsing that field's hint list and
         reflowing this button out from under the click — so removal needed a
         second click. Keeping focus put lets the click reach onClick undisturbed. */
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Icon name="closeSmall" />
    </RemoveButton>
  );
}

type ConditionDrillList = {
  title: ReactNode;
  items: DropdownItem[];
  selected: string[];
  onSelect: (id: string) => void;
};

/** @internal */
export type ConditionFilterShellProps = FieldOwnProps & {
  id?: string;
  placeholder?: string;
  isOpen: boolean;
  /** Closed-trigger / open-panel label (undefined → placeholder). */
  triggerValue: string | undefined;
  showPlaceholder: boolean;
  onOpen: () => void;
  onAbandon: () => void;
  onClearFilter: () => void;
  onClearDraft: () => void;
  onApply: () => void;
  screen: ConditionFilterScreen;
  onBack: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  valueBody: ReactNode;
  /** Content for operator / connector / chainOp screens; null on the value screen. */
  drill: ConditionDrillList | null;
  /**
   * Closed-trigger lines for the hover tooltip — one per condition, nothing
   * abbreviated. Used when the closed sentence is truncated; a value that
   * already fits is not repeated in a popover.
   */
  tooltipLines?: readonly string[];
  /**
   * Hover copy the closed trigger never shows in the box — date Condition's
   * resolved range. Unlike `tooltipLines`, it does not wait for truncation.
   */
  hint?: ReactNode;
  /** Overrides the panel's 260px English minimum (date Condition is 276px). */
  panelMinWidth?: string;
  /** A trigger that looks disabled, never opens, but still shows its `hint` on hover and focus. */
  locked?: boolean;
  /** Overrides the trigger's test id for a control that is not a Condition. */
  triggerTestId?: string;
  /** Overrides the panel's test id for a control that is not a Condition. */
  panelTestId?: string;
};

/**
 * Renders the Condition trigger and transactional panel chrome.
 * @param props - Field chrome, open state, value body, and optional drill list.
 * @returns Selector with popover panel.
 * @internal
 */
export function ConditionFilterShell(props: ConditionFilterShellProps) {
  const {
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
    placeholder,
    isOpen,
    triggerValue,
    showPlaceholder,
    onOpen,
    onAbandon,
    onClearFilter,
    onClearDraft,
    onApply,
    screen,
    onBack,
    query,
    onQueryChange,
    valueBody,
    drill,
    tooltipLines,
    hint,
    panelMinWidth,
    locked,
    triggerTestId = 'filter-widget-condition-trigger',
    panelTestId = 'filter-widget-condition-panel',
  } = props;
  const { t } = useTranslation();
  const fieldId = useFieldId(id);
  const panelRadius: FieldRadius = radius ?? 's';
  const findInListPlaceholder = t('filterWidget.controls.findInList');

  /* The panel unmounts with whatever inside it held focus, which drops focus to the page — for a
     keyboard user that is losing their place. Hand it back to the trigger when the panel closes
     after an exit key, never after a pointer: refocusing then would light the trigger up on every click
     outside. */
  const closedByKeyboard = useRef(false);
  const wasOpen = useRef(isOpen);
  useEffect(() => {
    if (!isOpen) return undefined;
    /* Only the keys that leave the panel count: Escape, and Enter or Space on a footer button.
       Typing a digit or tabbing around is not an exit, so a close that merely follows it keeps
       focus where the user left it. */
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        closedByKeyboard.current = true;
      }
    };
    const onPointer = () => {
      closedByKeyboard.current = false;
    };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onPointer, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onPointer, true);
    };
  }, [isOpen]);
  useEffect(() => {
    if (wasOpen.current && !isOpen && closedByKeyboard.current) {
      const focused = document.activeElement;
      if (!focused || focused === document.body) {
        document.getElementById(fieldId)?.focus();
      }
    }
    closedByKeyboard.current = false;
    wasOpen.current = isOpen;
  }, [isOpen, fieldId]);

  /* Text Condition's member-hint list sits in normal flow right above this footer.
     Without this, a mousedown here blurs the focused value field first, collapsing
     that list and reflowing these buttons out from under the click — so the click
     landed on whatever took its place, and a second click was needed to actually
     act. Keeping focus put lets the click reach each button's own onClick
     undisturbed (numeric / date Condition have no hint list, so this is a no-op
     there). */
  const keepFocus = (event: ReactMouseEvent) => event.preventDefault();

  const footer = (
    <Foot>
      <ClearButton
        type="button"
        data-testid="filter-widget-panel-clear"
        $radius={panelRadius}
        onMouseDown={keepFocus}
        onClick={onClearDraft}
      >
        {t('filterWidget.controls.clear')}
      </ClearButton>
      <Actions>
        <SecondaryButton
          type="button"
          data-testid="filter-widget-panel-cancel"
          $radius={panelRadius}
          onMouseDown={keepFocus}
          onClick={onAbandon}
        >
          {t('filterEditor.buttons.cancel')}
        </SecondaryButton>
        <PrimaryButton
          type="button"
          data-testid="filter-widget-panel-apply"
          $radius={panelRadius}
          onMouseDown={keepFocus}
          onClick={onApply}
        >
          {t('filterEditor.buttons.apply')}
        </PrimaryButton>
      </Actions>
    </Foot>
  );

  const drillBody = drill ? (
    <>
      <Head type="button" data-testid="filter-widget-panel-back" onClick={onBack}>
        <Icon name="arrowLeft" box={12} />
        {drill.title}
      </Head>
      {drill.items.length > SEARCH_THRESHOLD && (
        <SearchRow>
          <SecondaryGlyph>
            <Icon name="search" />
          </SecondaryGlyph>
          <FieldInput
            type="text"
            autoComplete="off"
            data-testid="filter-widget-condition-search"
            value={query}
            placeholder={findInListPlaceholder}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </SearchRow>
      )}
      <DrillChoiceList
        radius={radius}
        label={typeof drill.title === 'string' ? drill.title : undefined}
        items={drill.items}
        selected={drill.selected}
        onSelect={drill.onSelect}
        emptyMessage={t('filterWidget.controls.noMatches')}
      />
      {footer}
    </>
  ) : null;

  const panel = (
    <Panel $radius={panelRadius} $minWidth={panelMinWidth} data-testid={panelTestId}>
      {screen.kind === 'value' ? (
        <>
          {valueBody}
          {footer}
        </>
      ) : (
        drillBody
      )}
    </Panel>
  );

  const setFilterLabel = placeholder ?? t('filterWidget.placeholders.setFilter');
  /* Empty closed Condition must paint "Set filter" as a real value (primary ink). An HTML
     placeholder alone lands on secondary via `::placeholder`, while List/Period empty
     triggers read as primary because `-webkit-text-fill-color` on the input wins there. */
  const closedTriggerValue = showPlaceholder ? setFilterLabel : triggerValue;

  return (
    <Selector
      id={fieldId}
      dataTestId={triggerTestId}
      label={label}
      error={error}
      disabled={disabled}
      locked={locked}
      state={state}
      size={size}
      radius={radius}
      width={width}
      controlStyle={controlStyle}
      className={className}
      value={isOpen ? triggerValue : closedTriggerValue}
      placeholder={setFilterLabel}
      hint={hint}
      tooltip={
        tooltipLines && tooltipLines.length > 1
          ? tooltipLines.map((line, index) => <span key={`${index}:${line}`}>{line}</span>)
          : undefined
      }
      searchable={false}
      clearable={!showPlaceholder && !isOpen}
      onClear={onClearFilter}
      open={isOpen}
      onOpenChange={(next) => (next ? onOpen() : onAbandon())}
      popover={isOpen ? panel : null}
    />
  );
}
