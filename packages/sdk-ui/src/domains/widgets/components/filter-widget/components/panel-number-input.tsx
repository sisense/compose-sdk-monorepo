/**
 * Numeric value entry inside a Condition filter panel.
 *
 * Uses `type="text"` with `inputMode="decimal"` so invalid input (e.g. `mkk`) can
 * land in the field and surface `filterEditor.validationErrors.invalidNumber` on
 * Apply — a native `type="number"` would silently drop non-numeric keystrokes.
 * No stepper: filter values are figures from the column, not counts to nudge.
 * @internal
 */
import { useState } from 'react';

import type { FieldRadius, FieldSize } from './design-tokens';
import { Field, FieldInput, resolveFieldState } from './field';
import type { FieldOwnProps } from './field';
import { useFieldId } from './use-field-id';
import { useHover } from './use-hover';

const PANEL_SIZE: FieldSize = 's';

/** @internal */
export type PanelNumberInputProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  /** Accessible name when there is no visible label (e.g. Between min/max). */
  ariaLabel?: string;
  error?: FieldOwnProps['error'];
  radius?: FieldRadius;
  controlStyle?: FieldOwnProps['controlStyle'];
  dataTestId?: string;
  id?: string;
};

/** @internal */
export function PanelNumberInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  error,
  radius,
  controlStyle,
  dataTestId = 'filter-widget-condition-value',
  id,
}: PanelNumberInputProps) {
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
        inputMode="decimal"
        autoComplete="off"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={message ? errorId : undefined}
        data-testid={dataTestId}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
