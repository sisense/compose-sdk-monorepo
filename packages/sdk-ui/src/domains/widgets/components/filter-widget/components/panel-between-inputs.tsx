/**
 * Between (min – max) value row for a numeric Condition filter panel.
 *
 * Two {@link PanelNumberInput} halves with an en-dash between them, plus an optional
 * full-width range-order error when the upper bound is not greater than the lower.
 * @internal
 */
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import { Row } from './condition-filter-layout.js';
import type { FieldRadius } from './design-tokens';
import { FIELD_HEIGHT, spacing, typography } from './design-tokens';
import type { FieldOwnProps } from './field';
import { fwFallback, fwVar } from './field-palette';
import { PanelNumberInput } from './panel-number-input.js';

const PANEL_SIZE = 's' as const;

const Dash = styled.span`
  flex: 0 0 auto;
  align-self: flex-start;
  display: flex;
  align-items: center;
  height: ${FIELD_HEIGHT[PANEL_SIZE]};
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
`;

const RangeError = styled.p`
  width: 100%;
  margin: ${spacing.xs} 0 0;
  font-size: ${typography.paragraph.size};
  line-height: ${typography.paragraph.lineHeight};
  color: ${fwVar('error', fwFallback.error)};
  word-break: break-word;
`;

const BetweenStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
`;

const BetweenHalf = styled.div`
  flex: 1 1 0;
  min-width: 0;
`;

/** @internal */
export type PanelBetweenInputsProps = {
  min: string;
  max: string;
  onMinChange: (next: string) => void;
  onMaxChange: (next: string) => void;
  minError?: FieldOwnProps['error'];
  maxError?: FieldOwnProps['error'];
  /** Full-width message when max ≤ min (both bounds are valid numbers). */
  rangeError?: string;
  placeholder?: string;
  radius?: FieldRadius;
  controlStyle?: FieldOwnProps['controlStyle'];
  minDataTestId?: string;
  maxDataTestId?: string;
};

/** @internal */
export function PanelBetweenInputs({
  min,
  max,
  onMinChange,
  onMaxChange,
  minError,
  maxError,
  rangeError,
  placeholder,
  radius,
  controlStyle,
  minDataTestId = 'filter-widget-condition-between-min',
  maxDataTestId = 'filter-widget-condition-between-max',
}: PanelBetweenInputsProps) {
  const { t } = useTranslation();
  const rangeBorder = rangeError ? true : undefined;
  const minLabel = t('filterWidget.controls.betweenMin', 'Minimum');
  const maxLabel = t('filterWidget.controls.betweenMax', 'Maximum');

  return (
    <BetweenStack data-testid="filter-widget-condition-between">
      <Row>
        <BetweenHalf>
          <PanelNumberInput
            value={min}
            onChange={onMinChange}
            placeholder={placeholder}
            ariaLabel={minLabel}
            error={minError ?? rangeBorder}
            radius={radius}
            controlStyle={controlStyle}
            dataTestId={minDataTestId}
          />
        </BetweenHalf>
        <Dash aria-hidden="true">–</Dash>
        <BetweenHalf>
          <PanelNumberInput
            value={max}
            onChange={onMaxChange}
            placeholder={placeholder}
            ariaLabel={maxLabel}
            error={maxError ?? rangeBorder}
            radius={radius}
            controlStyle={controlStyle}
            dataTestId={maxDataTestId}
          />
        </BetweenHalf>
      </Row>
      {rangeError ? <RangeError role="alert">{rangeError}</RangeError> : null}
    </BetweenStack>
  );
}
