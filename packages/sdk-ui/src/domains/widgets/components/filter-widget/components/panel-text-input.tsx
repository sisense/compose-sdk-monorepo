/**
 * Free-text value entry inside a Condition filter panel (no search glyph —
 * this is "Enter value...", not member search).
 * @internal
 */
import { useState } from 'react';
import type { KeyboardEvent } from 'react';

import type { FieldRadius, FieldSize } from './design-tokens';
import { Field, FieldInput, resolveFieldState } from './field';
import type { FieldOwnProps } from './field';
import { useFieldId } from './use-field-id';
import { useHover } from './use-hover';

const PANEL_SIZE: FieldSize = 's';

/** @internal */
export type PanelTextInputProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  error?: FieldOwnProps['error'];
  radius?: FieldRadius;
  controlStyle?: FieldOwnProps['controlStyle'];
  dataTestId?: string;
  id?: string;
  /** Focus of this entry — suggestions belong to the field being typed in. */
  onFocusChange?: (focused: boolean) => void;
  /** Combobox key handling when member hints are open under the field. */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Id of the hint listbox this field controls while suggestions are shown. */
  listboxId?: string;
  /** `aria-activedescendant` target for the keyboard-highlighted hint row. */
  activeOptionId?: string;
};

/** @internal */
export function PanelTextInput({
  value,
  onChange,
  placeholder,
  error,
  radius,
  controlStyle,
  dataTestId = 'filter-widget-condition-value',
  id,
  onFocusChange,
  onKeyDown,
  listboxId,
  activeOptionId,
}: PanelTextInputProps) {
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
  const hintsOpen = Boolean(listboxId);
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
        onFocusCapture: () => {
          setFocused(true);
          onFocusChange?.(true);
        },
        onBlurCapture: () => {
          setFocused(false);
          onFocusChange?.(false);
        },
      }}
    >
      <FieldInput
        id={inputId}
        type="text"
        role={hintsOpen ? 'combobox' : undefined}
        aria-expanded={hintsOpen || undefined}
        aria-haspopup={hintsOpen ? 'listbox' : undefined}
        aria-controls={listboxId}
        aria-activedescendant={hintsOpen ? activeOptionId : undefined}
        aria-autocomplete={hintsOpen ? 'list' : undefined}
        autoComplete="off"
        aria-invalid={invalid || undefined}
        aria-describedby={message ? errorId : undefined}
        data-testid={dataTestId}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
    </Field>
  );
}
