/**
 * Numeric Condition control for FilterWidget — operator + value behind a trigger,
 * with optional AND/OR chaining (`+ Add condition`). Between is primary-only.
 *
 * Panel chrome: {@link ConditionFilterShell}; navigation state:
 * {@link useConditionFilterPanel}. This file owns numeric draft mapping, validation,
 * and value fields.
 * @internal
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Attribute, Filter } from '@sisense/sdk-data';

import { isNumericString } from '@/shared/utils/is-numeric-string.js';

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
  defaultNumericConditionDraft,
  describeNumericCondition,
  filterToNumericConditionDraft,
  isNumericConditionChainable,
  isNumericConditionComplete,
  isNumericConditionPrimaryFilled,
  newNumericConditionRowId,
  NUMERIC_CHAIN_OPERATORS,
  NUMERIC_CONDITION_OPERATORS,
  type NumericConditionDraft,
  type NumericConditionOp,
  type NumericConditionRow,
  numericConditionToFilter,
  numericOperatorOf,
  summariseNumericCondition,
  summariseNumericConditionDraft,
} from './condition-numeric.js';
import type { DropdownItem } from './dropdown';
import type { FieldOwnProps } from './field';
import { PanelBetweenInputs } from './panel-between-inputs.js';
import { PanelNumberInput } from './panel-number-input.js';
import { Selector } from './selector';
import { useConditionFilterPanel } from './use-condition-filter-panel.js';

/** @internal */
export type ConditionFilterNumericProps = FieldOwnProps & {
  attribute: Attribute;
  filter?: Filter | null;
  onFilterUpdate?: (filter: Filter | null) => void;
  allowChaining?: boolean;
  placeholder?: string;
  id?: string;
};

/**
 * @param props - Attribute, linked filter, and publish callback
 * @returns The numeric Condition trigger and its drill-in panel
 * @internal
 */
export function ConditionFilterNumeric({
  attribute,
  filter = null,
  onFilterUpdate,
  allowChaining = true,
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
}: ConditionFilterNumericProps) {
  const { t } = useTranslation();

  const operatorItems: DropdownItem[] = useMemo(
    () =>
      NUMERIC_CONDITION_OPERATORS.map((op) => ({
        id: op.id,
        label: op.glyph ? `${op.glyph} ${t(op.labelKey)}` : t(op.labelKey),
      })),
    [t],
  );

  const chainOperatorItems: DropdownItem[] = useMemo(
    () =>
      NUMERIC_CHAIN_OPERATORS.map((op) => ({
        id: op.id,
        label: op.glyph ? `${op.glyph} ${t(op.labelKey)}` : t(op.labelKey),
      })),
    [t],
  );

  const panel = useConditionFilterPanel<
    NumericConditionOp,
    NumericConditionRow,
    NumericConditionDraft
  >({
    filter,
    toDraft: filterToNumericConditionDraft,
    defaultDraft: defaultNumericConditionDraft,
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

  /* Glyphs belong on the operator list only — the closed trigger and tooltip
     read the words, matching the prototype (`operator.label`, not `glyph`). */
  const labelOf = (op: NumericConditionOp) => t(numericOperatorOf(op).labelKey);
  const fillOrRemove = t(
    'filterWidget.controls.fillOrRemoveCondition',
    'Fill this or remove the condition',
  );
  const enterValuePlaceholder = t('filterWidget.controls.enterValue', 'Enter value...');
  const selectConditionLabel = t('filterWidget.controls.selectCondition', 'Select condition');
  const invalidNumberMsg = t('filterEditor.validationErrors.invalidNumber');
  const rangeOrderError = t(
    'filterWidget.controls.rangeOrderError',
    'Second value must be greater than the first',
  );

  const shape = numericOperatorOf(draft.op).shape;
  const chaining = isNumericConditionChainable(shape);
  const multiple = draft.extra.length > 0;
  const committedLabel = summariseNumericCondition(committed, labelOf);
  const openLabel = summariseNumericConditionDraft(draft, labelOf);
  const showPlaceholder = !committedLabel;
  const tooltipLines = describeNumericCondition(committed, labelOf);

  const fieldError = (value: string, requireFilled: boolean): string | undefined => {
    if (!triedApply) return undefined;
    if (value.trim() === '') return requireFilled ? fillOrRemove : undefined;
    if (!isNumericString(value)) return invalidNumberMsg;
    return undefined;
  };

  const primaryError =
    triedApply && multiple && !isNumericConditionPrimaryFilled(draft) ? fillOrRemove : undefined;
  const primaryNumberError =
    shape === 'number' ? fieldError(draft.number, !multiple) ?? primaryError : primaryError;
  const minError = shape === 'between' ? fieldError(draft.min, true) : undefined;
  const maxError = shape === 'between' ? fieldError(draft.max, true) : undefined;
  const rangeError =
    triedApply &&
    shape === 'between' &&
    !minError &&
    !maxError &&
    isNumericString(draft.min) &&
    isNumericString(draft.max) &&
    Number(draft.max) <= Number(draft.min)
      ? rangeOrderError
      : undefined;

  const rowError = (row: NumericConditionRow): string | undefined => fieldError(row.number, true);

  const numericValueValid = (() => {
    if (shape === 'number') {
      return draft.number.trim() === '' || isNumericString(draft.number);
    }
    if (shape === 'between') {
      const minOk = draft.min.trim() === '' || isNumericString(draft.min);
      const maxOk = draft.max.trim() === '' || isNumericString(draft.max);
      const orderOk =
        !isNumericString(draft.min) ||
        !isNumericString(draft.max) ||
        Number(draft.max) > Number(draft.min);
      return minOk && maxOk && orderOk;
    }
    return true;
  })();

  const chainNumericValid = draft.extra.every(
    (row) => row.number.trim() === '' || isNumericString(row.number),
  );

  const commit = () => {
    if (!multiple && shape === 'number' && draft.number.trim() === '') {
      onFilterUpdate?.(null);
      close();
      return;
    }
    if (!multiple && shape === 'between' && draft.min.trim() === '' && draft.max.trim() === '') {
      onFilterUpdate?.(null);
      close();
      return;
    }
    if (!isNumericConditionComplete(draft) || !numericValueValid || !chainNumericValid) {
      setTriedApply(true);
      return;
    }
    const config = filter?.config ? { ...filter.config } : undefined;
    onFilterUpdate?.(numericConditionToFilter(attribute, draft, config));
    close();
  };

  const pickPrimaryOperator = (next: string) => {
    const op = next as NumericConditionOp;
    const nextShape = numericOperatorOf(op).shape;
    setDraft((prev) => ({
      ...prev,
      op,
      number: nextShape === 'number' ? prev.number : '',
      min: nextShape === 'between' ? prev.min : '',
      max: nextShape === 'between' ? prev.max : '',
      extra: isNumericConditionChainable(nextShape) ? prev.extra : [],
    }));
    setTriedApply(false);
    back();
  };

  const removePrimary = () => {
    setDraft((prev) => {
      const [first, ...rest] = prev.extra;
      if (!first) return prev;
      return {
        ...prev,
        op: first.op,
        number: first.number,
        min: '',
        max: '',
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
          id: newNumericConditionRowId(),
          op: NUMERIC_CHAIN_OPERATORS[0].id,
          number: '',
        },
      ],
    }));
    setTriedApply(false);
  };

  const drill = buildDrill({
    selectConditionLabel,
    onPickPrimary: pickPrimaryOperator,
    onPickChainOp: (rowId, opId) => updateRow(rowId, { op: opId as NumericConditionOp }),
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
    shape === 'number' ? (
      <PanelNumberInput
        value={draft.number}
        onChange={(number) => {
          setDraft((prev) => ({ ...prev, number }));
          setTriedApply(false);
        }}
        placeholder={enterValuePlaceholder}
        error={primaryNumberError}
        radius={radius}
        controlStyle={controlStyle}
      />
    ) : shape === 'between' ? (
      <PanelBetweenInputs
        min={draft.min}
        max={draft.max}
        onMinChange={(min) => {
          setDraft((prev) => ({ ...prev, min }));
          setTriedApply(false);
        }}
        onMaxChange={(max) => {
          setDraft((prev) => ({ ...prev, max }));
          setTriedApply(false);
        }}
        placeholder={enterValuePlaceholder}
        minError={minError}
        maxError={maxError}
        rangeError={rangeError}
        radius={radius}
        controlStyle={controlStyle}
      />
    ) : null;

  const valueBody = (
    <Stack>
      {primaryOperatorField}

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
                      <ConnectorText>{connectorLabel(draft.connector)}</ConnectorText>
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
                </Row>
                <Row>
                  <RowGrow>
                    <PanelNumberInput
                      value={row.number}
                      onChange={(number) => {
                        updateRow(row.id, { number });
                        setTriedApply(false);
                      }}
                      placeholder={enterValuePlaceholder}
                      error={err}
                      radius={radius}
                      controlStyle={controlStyle}
                      dataTestId="filter-widget-condition-chain-value"
                    />
                  </RowGrow>
                  <ConditionRemoveControl onClick={() => removeRow(row.id)} />
                </Row>
              </ChainBlock>
            );
          })}

          {allowChaining && (
            <AddCondition type="button" data-testid="filter-widget-condition-add" onClick={addRow}>
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
