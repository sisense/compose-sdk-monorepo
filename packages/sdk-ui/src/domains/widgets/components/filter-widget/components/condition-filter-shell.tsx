/**
 * Shared panel shell for ConditionFilterText / ConditionFilterNumeric —
 * trigger Selector, drill-in lists, Clear · Cancel · Apply.
 *
 * Domain draft / validation / value fields stay in each control; only the chrome
 * is shared so shell bugs are fixed once.
 * @internal
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { RemoveButton } from './condition-filter-layout.js';
import type { FieldRadius, FieldSize } from './design-tokens';
import { Dropdown } from './dropdown';
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
  | { kind: 'chainOp'; rowId: string };

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
};

/**
 * Renders the Condition trigger and transactional panel chrome.
 * @param props - Field chrome, open state, value body, and optional drill list
 * @returns Selector with popover panel
 * @internal
 */
export function ConditionFilterShell({
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
}: ConditionFilterShellProps) {
  const { t } = useTranslation();
  const fieldId = useFieldId(id);
  const panelRadius: FieldRadius = radius ?? 's';
  const findInListPlaceholder = t('filterWidget.controls.findInList');

  const footer = (
    <Foot>
      <ClearButton
        type="button"
        data-testid="filter-widget-panel-clear"
        $radius={panelRadius}
        onClick={onClearDraft}
      >
        {t('filterWidget.controls.clear')}
      </ClearButton>
      <Actions>
        <SecondaryButton
          type="button"
          data-testid="filter-widget-panel-cancel"
          $radius={panelRadius}
          onClick={onAbandon}
        >
          {t('filterEditor.buttons.cancel')}
        </SecondaryButton>
        <PrimaryButton
          type="button"
          data-testid="filter-widget-panel-apply"
          $radius={panelRadius}
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
      <Dropdown
        mode="single"
        radius={radius}
        surface={false}
        width="100%"
        items={drill.items}
        selected={drill.selected}
        onSelect={drill.onSelect}
        emptyMessage={t('filterWidget.controls.noMatches')}
      />
      {footer}
    </>
  ) : null;

  const panel = (
    <Panel $radius={panelRadius} data-testid="filter-widget-condition-panel">
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

  return (
    <Selector
      id={fieldId}
      dataTestId="filter-widget-condition-trigger"
      label={label}
      error={error}
      disabled={disabled}
      state={state}
      size={size}
      radius={radius}
      width={width}
      controlStyle={controlStyle}
      className={className}
      value={triggerValue}
      placeholder={placeholder ?? t('filterWidget.placeholders.setFilter')}
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
