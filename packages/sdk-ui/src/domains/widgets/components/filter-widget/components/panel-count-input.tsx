/**
 * Integer count entry inside a date Condition panel — Last N / Next N.
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
};

/** @internal */
export function PanelCountInput({
  value,
  onChange,
  ariaLabel,
  error,
  radius,
  controlStyle,
  dataTestId = 'filter-widget-condition-count',
  id,
}: PanelCountInputProps) {
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
        aria-invalid={invalid || undefined}
        aria-describedby={message ? errorId : undefined}
        data-testid={dataTestId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
