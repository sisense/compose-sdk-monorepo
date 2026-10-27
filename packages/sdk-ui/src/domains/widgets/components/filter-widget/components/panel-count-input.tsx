/**
 * Integer count entry inside a Condition or Rank panel — Last N / Next N, Top / Bottom N.
 *
 * Stepper arrows nudge whole numbers ≥ 1. The field itself is text so an incomplete
 * count (empty, 0, a fraction) can land and stay incomplete until Apply, matching
 * Before with no date.
 * @internal
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import { parseDateConditionCount } from './condition-date.js';
import type { FieldRadius, FieldSize } from './design-tokens';
import { Field, FieldInput, IconButton, resolveFieldState, Trailing } from './field';
import type { FieldOwnProps } from './field';
import { Icon } from './icons';
import { useFieldId } from './use-field-id';
import { useHover } from './use-hover';

const PANEL_SIZE: FieldSize = 's';

/** Fifteen digits always fit a safe integer — `Number.MAX_SAFE_INTEGER` has sixteen. */
const MAX_COUNT_DIGITS = 15;

/**
 * Keeps a typed or pasted count to what can be a count: digits only, no leading zeroes
 * (`01` → `1`, a lone `0` stays), at most {@link MAX_COUNT_DIGITS} long. What is left is
 * either a usable count, empty, or `0` — so the only error the field can show is "below 1".
 * @param text - The raw text in the field.
 * @returns The text the field keeps.
 * @internal
 */
export function normalizeCountInput(text: string): string {
  return text
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
    .slice(0, MAX_COUNT_DIGITS);
}

const Stepper = styled(Trailing)`
  flex-direction: column;
  width: 16px;
  margin-inline-end: 4px;
`;

const Step = styled(IconButton)`
  height: 10px;
  width: 16px;
  border-radius: 2px;
`;

/** @internal */
export type PanelCountInputProps = {
  value: string;
  onChange: (next: string) => void;
  ariaLabel?: string;
  error?: FieldOwnProps['error'];
  radius?: FieldRadius;
  controlStyle?: FieldOwnProps['controlStyle'];
  dataTestId?: string;
  id?: string;
  placeholder?: string;
  /** Keeps typed or pasted text to what the field accepts. Defaults to {@link normalizeCountInput}. */
  normalize?: (text: string) => string;
  /**
   * Steps the count by one. Given, it replaces the default whole-number nudge and also lets
   * ArrowUp / ArrowDown step the count from the keyboard.
   */
  step?: (value: string, delta: 1 | -1) => string;
};

/**
 * @param props - Value, change handler and the optional field behaviour.
 * @returns The count field with its stepper.
 * @internal
 */
export function PanelCountInput(props: PanelCountInputProps) {
  const {
    value,
    onChange,
    ariaLabel,
    error,
    radius,
    controlStyle,
    dataTestId = 'filter-widget-condition-count',
    id,
    placeholder,
    normalize = normalizeCountInput,
    step,
  } = props;
  const { t } = useTranslation();
  const fieldId = useFieldId(id);
  const inputId = `${fieldId}-input`;
  const errorId = `${fieldId}-error`;
  const invalid = Boolean(error);
  const message = typeof error === 'boolean' ? null : error;
  const { hovered, handlers } = useHover(false);
  const [focused, setFocused] = useState(false);
  const resolvedState = resolveFieldState({
    disabled: false,
    hovered,
    active: focused,
  });

  const nudge = (direction: 1 | -1) => {
    if (step) {
      onChange(step(value, direction));
      return;
    }
    const current = parseDateConditionCount(value) ?? 0;
    onChange(String(Math.max(1, current + direction)));
  };

  return (
    <Field
      error={error || undefined}
      errorId={message ? errorId : undefined}
      resolvedState={resolvedState}
      size={PANEL_SIZE}
      radius={radius}
      width="100%"
      controlStyle={controlStyle}
      boxProps={{
        ...handlers,
        onFocusCapture: () => setFocused(true),
        onBlurCapture: () => setFocused(false),
      }}
    >
      <FieldInput
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={ariaLabel}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={message ? errorId : undefined}
        data-testid={dataTestId}
        value={value}
        /* `inputMode` merely picks the mobile keypad — a text field takes any key, so the
           text is normalised here. Empty and `0` still land: an empty count stays
           incomplete until Apply, and `0` is flagged as below 1. */
        onChange={(event) => onChange(normalize(event.target.value))}
        onKeyDown={(event) => {
          if (!step || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
          event.preventDefault();
          nudge(event.key === 'ArrowUp' ? 1 : -1);
        }}
      />
      <Stepper>
        <Step
          type="button"
          data-testid={`${dataTestId}-up`}
          aria-label={t('filterWidget.controls.increaseCount', 'Increase')}
          onClick={() => nudge(1)}
        >
          <Icon name="chevronUp" box={8} />
        </Step>
        <Step
          type="button"
          data-testid={`${dataTestId}-down`}
          aria-label={t('filterWidget.controls.decreaseCount', 'Decrease')}
          onClick={() => nudge(-1)}
        >
          <Icon name="chevronDown" box={8} />
        </Step>
      </Stepper>
    </Field>
  );
}
