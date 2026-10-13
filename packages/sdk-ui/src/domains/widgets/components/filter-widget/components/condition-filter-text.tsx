/**
 * String Condition control for FilterWidget — operator + value behind a trigger,
 * with optional AND/OR chaining (`+ Add condition`).
 *
 * Panel chrome: {@link ConditionFilterShell}; navigation state:
 * {@link useConditionFilterPanel}. This file owns text draft mapping, validation,
 * and value fields.
 * @internal
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { type Attribute, type DataSource, type Filter, filterFactory } from '@sisense/sdk-data';

import { useGetFilterMembersInternal } from '@/domains/filters/hooks/use-get-filter-members';

import {
  AddCondition,
  ChainBlock,
  ConnectorSlot,
  ConnectorText,
  Row,
  RowGrow,
  Stack,
} from './condition-filter-layout.js';
import {
  CONDITION_PANEL_SIZE,
  ConditionFilterShell,
  ConditionRemoveControl,
} from './condition-filter-shell.js';
import {
  CONDITION_TEXT_HINT_LIMIT,
  type ConditionMemberHint,
  memberHintsForNeedle,
} from './condition-member-hints.js';
import {
  defaultTextConditionDraft,
  describeTextCondition,
  filterToTextConditionDraft,
  isTextConditionChainable,
  isTextConditionComplete,
  isTextConditionPrimaryFilled,
  newTextConditionRowId,
  operatorOf,
  summariseTextCondition,
  summariseTextConditionDraft,
  TEXT_CHAIN_OPERATORS,
  TEXT_CONDITION_OPERATORS,
  type TextConditionDraft,
  type TextConditionOp,
  type TextConditionRow,
  textConditionToFilter,
} from './condition-text.js';
import { Dropdown } from './dropdown';
import type { DropdownItem } from './dropdown';
import type { FieldOwnProps } from './field';
import { PanelTextInput } from './panel-text-input.js';
import { Selector } from './selector';
import { useConditionFilterPanel } from './use-condition-filter-panel.js';

/** @internal */
export type ConditionFilterTextProps = FieldOwnProps & {
  attribute: Attribute;
  /** Linked dashboard filter — text conditions are read in; anything else seeds empty. */
  filter?: Filter | null;
  /** Publishes on Apply and on the closed-trigger ✕. */
  onFilterUpdate?: (filter: Filter | null) => void;
  /**
   * When false, hide `+ Add condition`. Existing chain rows still render so a
   * saved multi-condition filter stays editable. Default true.
   */
  allowChaining?: boolean;
  /** Data source for the member-hint query. Falls back to the Sisense context default. */
  dataSource?: DataSource;
  /** Cascading parent filters, same as the List members query. */
  parentFilters?: Filter[];
  placeholder?: string;
  id?: string;
};

const NO_PARENT_FILTERS: Filter[] = [];
const PRIMARY_ENTRY = 'primary';

/**
 * Which member-search shape backs the hint list for each operator — matches the
 * row's own comparison, negation included: a `not-…` row hints members that would
 * actually pass it. `equals` / `not-equals` stay on `contains` while typing: an
 * exact-match (or doesn't-equal) query would show nothing (or almost everything)
 * until the full value is typed, defeating the point of a hint.
 */
const HINT_FILTER_BY_OP: Partial<
  Record<TextConditionOp, (attribute: Attribute, value: string) => Filter>
> = {
  'not-contains': filterFactory.doesntContain,
  'starts-with': filterFactory.startsWith,
  'not-starts-with': filterFactory.doesntStartWith,
  'ends-with': filterFactory.endsWith,
  'not-ends-with': filterFactory.doesntEndWith,
};

/**
 * Same shapes as {@link HINT_FILTER_BY_OP}, as a plain string check — the
 * client-side re-filter `memberHintsForNeedle` applies on top of whatever the
 * query above already returned. Without this it always re-checked `contains`,
 * which silently emptied the list for any `not-…` operator: the server had
 * already returned members that don't contain the needle, and a `contains`
 * re-check threw them straight back out.
 */
const HINT_MATCH_BY_OP: Partial<
  Record<TextConditionOp, (title: string, needle: string) => boolean>
> = {
  'not-contains': (title, needle) => !title.includes(needle),
  'starts-with': (title, needle) => title.startsWith(needle),
  'not-starts-with': (title, needle) => !title.startsWith(needle),
  'ends-with': (title, needle) => title.endsWith(needle),
  'not-ends-with': (title, needle) => !title.endsWith(needle),
};

/**
 * Renders a free-text condition value with inline member suggestions.
 *
 * Uses `Dropdown`'s `hint` mode under the field while typing. Suggestions are
 * optional — the user can enter any text, not only existing members. Arrow keys
 * move the highlight; Enter commits it; Escape clears the highlight.
 * @param props - Entry key, value handlers, member catalogue, and field chrome
 * @returns The text field and, while typing, the matching member hint list
 * @internal
 */
function ConditionTextEntry({
  entryKey,
  op,
  text,
  onChange,
  error,
  radius,
  controlStyle,
  members,
  typingIn,
  onTypingInChange,
  placeholder,
  dataTestId,
}: {
  entryKey: string;
  /** Drives which shape the hint list matches against — see {@link HINT_MATCH_BY_OP}. */
  op: TextConditionOp;
  text: string;
  onChange: (next: string) => void;
  error?: FieldOwnProps['error'];
  radius: ConditionFilterTextProps['radius'];
  controlStyle: ConditionFilterTextProps['controlStyle'];
  members: readonly ConditionMemberHint[];
  typingIn: string | null;
  onTypingInChange: (next: string | null | ((was: string | null) => string | null)) => void;
  placeholder: string;
  dataTestId?: string;
}) {
  const listboxId = `filter-widget-condition-hints-${entryKey}`;
  const hints = useMemo(
    () =>
      typingIn === entryKey
        ? memberHintsForNeedle(members, text, CONDITION_TEXT_HINT_LIMIT, HINT_MATCH_BY_OP[op])
        : [],
    [typingIn, entryKey, members, text, op],
  );
  const hintItems = useMemo(
    () => hints.map((member) => ({ id: member.key, label: member.title })),
    [hints],
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  // The needle rebuilds the list wholesale — drop a highlight that no longer exists.
  useEffect(() => {
    setActiveId((current) =>
      current && hintItems.some((item) => item.id === current) ? current : null,
    );
  }, [hintItems]);

  const selectHint = useCallback(
    (id: string) => {
      const title = hints.find((member) => member.key === id)?.title || id;
      setActiveId(null);
      onChange(title);
    },
    [hints, onChange],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (hintItems.length === 0) {
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        setActiveId((current) => {
          const index = hintItems.findIndex((item) => item.id === current);
          const next =
            index === -1 ? (direction === 1 ? 0 : hintItems.length - 1) : index + direction;
          return hintItems[(next + hintItems.length) % hintItems.length]?.id ?? null;
        });
      } else if (event.key === 'Enter' && activeId) {
        event.preventDefault();
        selectHint(activeId);
      } else if (event.key === 'Escape' && activeId) {
        event.preventDefault();
        setActiveId(null);
      }
    },
    [hintItems, activeId, selectHint],
  );

  const handleTextChange = useCallback(
    (next: string) => {
      setActiveId(null);
      onChange(next);
    },
    [onChange],
  );

  const handleFocusChange = useCallback(
    (focused: boolean) => {
      onTypingInChange(focused ? entryKey : (was) => (was === entryKey ? null : was));
    },
    [entryKey, onTypingInChange],
  );

  return (
    <>
      <PanelTextInput
        value={text}
        onChange={handleTextChange}
        placeholder={placeholder}
        error={error}
        radius={radius}
        controlStyle={controlStyle}
        dataTestId={dataTestId}
        onFocusChange={handleFocusChange}
        onKeyDown={onKeyDown}
        listboxId={hints.length > 0 ? listboxId : undefined}
        activeOptionId={activeId ? `${listboxId}-${activeId}` : undefined}
      />
      {hints.length > 0 && (
        /* preventDefault keeps focus (and the list) through a click on a row. */
        <div
          data-testid="filter-widget-condition-hints"
          onMouseDown={(event) => event.preventDefault()}
        >
          <Dropdown
            id={listboxId}
            mode="hint"
            radius={radius}
            surface={false}
            width="100%"
            items={hintItems}
            activeId={activeId ?? undefined}
            onSelect={selectHint}
          />
        </div>
      )}
    </>
  );
}

/**
 * @param props - Attribute, linked filter, and publish callback
 * @returns The Condition trigger and its drill-in panel
 * @internal
 */
export function ConditionFilterText({
  attribute,
  filter = null,
  onFilterUpdate,
  allowChaining = true,
  dataSource,
  parentFilters = NO_PARENT_FILTERS,
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
}: ConditionFilterTextProps) {
  const { t } = useTranslation();

  const operatorItems: DropdownItem[] = useMemo(
    () =>
      TEXT_CONDITION_OPERATORS.map((op) => ({
        id: op.id,
        label: t(op.labelKey),
      })),
    [t],
  );

  const chainOperatorItems: DropdownItem[] = useMemo(
    () =>
      TEXT_CHAIN_OPERATORS.map((op) => ({
        id: op.id,
        label: t(op.labelKey),
      })),
    [t],
  );

  const panel = useConditionFilterPanel<TextConditionOp, TextConditionRow, TextConditionDraft>({
    filter,
    toDraft: filterToTextConditionDraft,
    defaultDraft: defaultTextConditionDraft,
    operatorItems,
    chainOperatorItems,
  });

  const {
    isOpen,
    screen,
    query,
    setQuery,
    triedApply,
    setTriedApply,
    committed,
    draft,
    setDraft,
    open,
    back,
    close,
    abandon,
    clearDraft,
    openDrill,
    connectorLabel,
    updateRow,
    removeRow,
    buildDrill,
  } = panel;

  const [typingIn, setTypingIn] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) setTypingIn(null);
  }, [isOpen]);

  const liveNeedle =
    typingIn === PRIMARY_ENTRY
      ? draft.text
      : draft.extra.find((row) => row.id === typingIn)?.text ?? '';

  /* The operator of whichever row is currently being typed in — Starts with /
     Ends with (and their negations) search the hint list by that same shape
     (AC: hints must match the row's own operator, not always `contains`). */
  const liveOp: TextConditionOp =
    typingIn === PRIMARY_ENTRY
      ? draft.op
      : draft.extra.find((row) => row.id === typingIn)?.op ?? draft.op;

  const membersQueryFilter = useMemo(() => filterFactory.members(attribute, []), [attribute]);

  const hintParentFilters = useMemo(() => {
    const needle = liveNeedle.trim();
    if (!needle || !attribute.expression) return parentFilters;
    const buildHintFilter = HINT_FILTER_BY_OP[liveOp] ?? filterFactory.contains;
    return [...parentFilters, buildHintFilter(attribute, needle)];
  }, [attribute, liveNeedle, liveOp, parentFilters]);

  const { data: membersData } = useGetFilterMembersInternal({
    filter: membersQueryFilter,
    defaultDataSource: dataSource,
    parentFilters: hintParentFilters,
    count: CONDITION_TEXT_HINT_LIMIT,
    enabled: Boolean(attribute.expression && liveNeedle.trim()),
  });
  const members = membersData?.allMembers ?? [];

  const labelOf = (op: TextConditionOp) => t(operatorOf(op).labelKey);
  const fillOrRemove = t(
    'filterWidget.controls.fillOrRemoveCondition',
    'Fill this or remove the condition',
  );
  const enterValuePlaceholder = t('filterWidget.controls.enterValue', 'Enter value...');
  const selectConditionLabel = t('filterWidget.controls.selectCondition', 'Select condition');

  const shape = operatorOf(draft.op).shape;
  const chaining = isTextConditionChainable(shape);
  const multiple = draft.extra.length > 0;
  const committedLabel = summariseTextCondition(committed, labelOf);
  const openLabel = summariseTextConditionDraft(draft, labelOf);
  const showPlaceholder = !committedLabel;
  const tooltipLines = describeTextCondition(committed, labelOf);

  const primaryError =
    triedApply && multiple && !isTextConditionPrimaryFilled(draft) ? fillOrRemove : undefined;
  const primaryValueError =
    triedApply && shape === 'text' && draft.text.trim() === '' && !multiple
      ? fillOrRemove
      : primaryError;
  const rowError = (row: TextConditionRow): string | undefined => {
    if (!triedApply) return undefined;
    if (operatorOf(row.op).shape === 'none') return undefined;
    return row.text.trim() === '' ? fillOrRemove : undefined;
  };

  const commit = () => {
    /* Lone blank value-requiring condition → clear (same as Clear + close). */
    if (!multiple && shape === 'text' && draft.text.trim() === '') {
      onFilterUpdate?.(null);
      close();
      return;
    }
    if (!isTextConditionComplete(draft)) {
      setTriedApply(true);
      return;
    }
    const config = filter?.config ? { ...filter.config } : undefined;
    onFilterUpdate?.(textConditionToFilter(attribute, draft, config));
    close();
  };

  const pickPrimaryOperator = (next: string) => {
    const op = next as TextConditionOp;
    const nextShape = operatorOf(op).shape;
    setDraft((prev) => ({
      ...prev,
      op,
      text: nextShape === 'text' ? prev.text : '',
      /* Drop the chain when the new primary cannot accept one (text shapes always can). */
      extra: isTextConditionChainable(nextShape) ? prev.extra : [],
    }));
    setTriedApply(false);
    back();
  };

  /** Promote the first chained row into the primary and shuffle the rest up. */
  const removePrimary = () => {
    setDraft((prev) => {
      const [first, ...rest] = prev.extra;
      if (!first) return prev;
      return {
        ...prev,
        op: first.op,
        text: first.text,
        extra: rest,
      };
    });
    setTriedApply(false);
  };

  const addRow = () => {
    setDraft((prev) => ({
      ...prev,
      extra: [
        ...prev.extra,
        {
          id: newTextConditionRowId(),
          op: TEXT_CHAIN_OPERATORS[0].id,
          text: '',
        },
      ],
    }));
    setTriedApply(false);
    /* Add-condition doesn't close the panel, so the hint list (if any was open)
       must be dropped explicitly rather than by the isOpen effect. */
    setTypingIn(null);
  };

  const drill = buildDrill({
    selectConditionLabel,
    onPickPrimary: pickPrimaryOperator,
    onPickChainOp: (rowId, opId) => updateRow(rowId, { op: opId as TextConditionOp }),
  });

  const primaryOperatorField = (
    <Selector
      dataTestId="filter-widget-condition-operator"
      size={CONDITION_PANEL_SIZE}
      radius={radius}
      width="100%"
      value={labelOf(draft.op)}
      placeholder={selectConditionLabel}
      searchable={false}
      clearable={false}
      controlStyle={controlStyle}
      onOpenChange={(next) => {
        if (!next) return;
        openDrill({ kind: 'operator' });
      }}
    />
  );

  const primaryValueField =
    shape === 'text' ? (
      <ConditionTextEntry
        entryKey={PRIMARY_ENTRY}
        op={draft.op}
        text={draft.text}
        onChange={(text) => {
          setDraft((prev) => ({ ...prev, text }));
          setTriedApply(false);
        }}
        placeholder={enterValuePlaceholder}
        error={primaryValueError}
        radius={radius}
        controlStyle={controlStyle}
        members={members}
        typingIn={typingIn}
        onTypingInChange={setTypingIn}
      />
    ) : null;

  const valueBody = (
    <Stack>
      {shape === 'none' && chaining && multiple ? (
        <Row>
          <RowGrow>{primaryOperatorField}</RowGrow>
          <ConditionRemoveControl onClick={removePrimary} />
        </Row>
      ) : (
        primaryOperatorField
      )}

      {primaryValueField &&
        (chaining && multiple ? (
          <Row>
            <RowGrow>{primaryValueField}</RowGrow>
            <ConditionRemoveControl onClick={removePrimary} />
          </Row>
        ) : (
          primaryValueField
        ))}

      {chaining && (
        <>
          {draft.extra.map((row, index) => {
            const rowShape = operatorOf(row.op).shape;
            const valueless = rowShape === 'none';
            const err = rowError(row);
            return (
              <ChainBlock key={row.id} data-testid="filter-widget-condition-chain-row">
                <Row>
                  <ConnectorSlot>
                    {index === 0 ? (
                      <Selector
                        dataTestId="filter-widget-condition-connector"
                        size={CONDITION_PANEL_SIZE}
                        radius={radius}
                        width="100%"
                        value={connectorLabel(draft.connector)}
                        searchable={false}
                        clearable={false}
                        controlStyle={controlStyle}
                        onOpenChange={(next) => {
                          if (!next) return;
                          openDrill({ kind: 'connector' });
                        }}
                      />
                    ) : (
                      <ConnectorText $radius={radius}>
                        {connectorLabel(draft.connector)}
                      </ConnectorText>
                    )}
                  </ConnectorSlot>
                  <RowGrow>
                    <Selector
                      dataTestId="filter-widget-condition-chain-operator"
                      size={CONDITION_PANEL_SIZE}
                      radius={radius}
                      width="100%"
                      value={labelOf(row.op)}
                      searchable={false}
                      clearable={false}
                      controlStyle={controlStyle}
                      onOpenChange={(next) => {
                        if (!next) return;
                        openDrill({ kind: 'chainOp', rowId: row.id });
                      }}
                    />
                  </RowGrow>
                  {valueless && <ConditionRemoveControl onClick={() => removeRow(row.id)} />}
                </Row>
                {!valueless && (
                  <Row>
                    <RowGrow>
                      <ConditionTextEntry
                        entryKey={row.id}
                        op={row.op}
                        text={row.text}
                        onChange={(text) => {
                          updateRow(row.id, { text });
                          setTriedApply(false);
                        }}
                        placeholder={enterValuePlaceholder}
                        error={err}
                        radius={radius}
                        controlStyle={controlStyle}
                        members={members}
                        typingIn={typingIn}
                        onTypingInChange={setTypingIn}
                        dataTestId="filter-widget-condition-chain-value"
                      />
                    </RowGrow>
                    <ConditionRemoveControl onClick={() => removeRow(row.id)} />
                  </Row>
                )}
              </ChainBlock>
            );
          })}

          {allowChaining && (
            <AddCondition
              type="button"
              $radius={radius}
              data-testid="filter-widget-condition-add"
              /* Without this, a mousedown here blurs the focused value field first,
                 collapsing the hint list (in normal flow) and reflowing this very
                 button out from under the click — so the click landed on whatever
                 took its place, and a second click was needed to actually add a
                 row. Keeping focus put lets the click reach onClick undisturbed. */
              onMouseDown={(event) => event.preventDefault()}
              onClick={addRow}
            >
              {t('filterWidget.controls.addCondition', '+ Add condition')}
            </AddCondition>
          )}
        </>
      )}
    </Stack>
  );

  return (
    <ConditionFilterShell
      id={id}
      label={label}
      error={error}
      disabled={disabled}
      state={state}
      size={size}
      radius={radius}
      width={width}
      controlStyle={controlStyle}
      className={className}
      placeholder={placeholder}
      isOpen={isOpen}
      triggerValue={isOpen ? openLabel : committedLabel}
      showPlaceholder={showPlaceholder}
      tooltipLines={isOpen ? undefined : tooltipLines}
      onOpen={open}
      onAbandon={abandon}
      onClearFilter={() => onFilterUpdate?.(null)}
      onClearDraft={clearDraft}
      onApply={commit}
      screen={screen}
      onBack={back}
      query={query}
      onQueryChange={setQuery}
      valueBody={valueBody}
      drill={drill}
    />
  );
}
