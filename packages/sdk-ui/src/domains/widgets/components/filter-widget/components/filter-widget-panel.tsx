/**
 * Shared shell for drill-in filter panels — PeriodFilter, ConditionFilter, and any
 * future panel that follows the same Clear · Cancel · Apply frame.
 *
 * @internal
 */
import styled from '@emotion/styled';

import { FIELD_HEIGHT, FIELD_RADIUS, spacing, typography } from './design-tokens';
import type { FieldRadius } from './design-tokens';
import { fwFallback, fwFieldShadow, fwVar } from './field-palette';

/**
 * Every rule inside the panel, lighter than a field's border: these separate regions of
 * one surface rather than holding a control together.
 */
const RULE = `color-mix(in srgb, ${fwVar('border', fwFallback.border)} 55%, ${fwVar(
  'panelBg',
  fwFallback.panelBg,
)})`;

/**
 * Styles the drill-in panel, which keeps its own tighter rhythm than a bare list — 12px
 * padding, an 8px stack gap, 260px wide.
 * @internal
 */
export const Panel = styled.div<{ $radius: FieldRadius }>`
  display: flex;
  flex-direction: column;
  gap: ${spacing.m};
  align-items: stretch;
  box-sizing: border-box;
  width: 260px;
  padding: 12px;
  font-family: ${fwVar('fontFamily', fwFallback.fontFamily)};
  background: ${fwVar('panelBg', fwFallback.panelBg)};
  border-radius: ${({ $radius }) => FIELD_RADIUS[$radius]};
  box-shadow: ${fwFieldShadow};
`;

/** Styles a drill-in head: where you are, and the way back. @internal */
export const Head = styled.button`
  display: flex;
  gap: ${spacing.m};
  align-items: center;
  width: 100%;
  padding: 0 0 10px;
  font-family: inherit;
  font-size: ${typography.label.size};
  line-height: ${typography.label.lineHeight};
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
  text-align: left;
  cursor: pointer;
  background: none;
  border: 0;
  border-bottom: ${spacing.borderWidth} solid ${RULE};

  &:hover {
    color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  }
`;

/** Styles the footer, whose rule stops where the content does. @internal */
export const Foot = styled.div`
  display: flex;
  gap: ${spacing.m};
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: ${spacing.borderWidth} solid ${RULE};
`;

/** Groups the footer's confirming actions, so Clear can sit apart from them. @internal */
export const Actions = styled.div`
  display: flex;
  gap: ${spacing.m};
  align-items: center;
`;

/** Defines the metrics the footer's three buttons share; each variant adds only its colours. @internal */
export const PanelButton = styled.button<{ $radius: FieldRadius }>`
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  height: ${FIELD_HEIGHT.s};
  padding: 0 16px;
  font-family: inherit;
  font-size: ${typography.label.size};
  font-weight: ${typography.label.weight};
  line-height: ${typography.label.lineHeight};
  cursor: pointer;
  border: ${spacing.borderWidth} solid transparent;
  border-radius: ${({ $radius }) => FIELD_RADIUS[$radius]};
`;

/**
 * Styles Apply as the application's primary button.
 *
 * It follows the theme's Primary Button roles, not the control's `accent`. Accent is a
 * decorative token the Filter Style panel exposes, so taking the fill from it meant styling
 * one filter widget restyled its Apply while every other Apply in the product stayed on the
 * theme. A submit button is not decoration.
 * @internal
 */
export const PrimaryButton = styled(PanelButton)`
  /* Doubled class, deliberately. An embedding host may colour bare \`button\` elements, and such
     a selector outranks a single generated class — so the theme's button text colour lost to
     the host's, while the backgrounds, which the host did not set, came through. Doubling the
     class raises these declarations above it. */
  && {
    color: ${fwVar('buttonPrimaryText', fwFallback.buttonPrimaryText)};
  }
  background: ${fwVar('buttonPrimaryBg', fwFallback.buttonPrimaryBg)};

  &:hover:not(:disabled) {
    background: ${fwVar('buttonPrimaryHover', fwFallback.buttonPrimaryHover)};
  }
`;

/** Styles Cancel as a filled grey button, no border. @internal */
export const SecondaryButton = styled(PanelButton)`
  && {
    color: ${fwVar('buttonCancelText', fwFallback.buttonCancelText)};
  }
  background: ${fwVar('buttonCancelBg', fwFallback.buttonCancelBg)};

  &:hover:not(:disabled) {
    background: ${fwVar('buttonCancelHover', fwFallback.buttonCancelHover)};
  }
`;

/** Styles Clear as a text button beside the filled Apply and grey Cancel. @internal */
export const ClearButton = styled(PanelButton)`
  flex: 0 0 auto;
  padding: 0 12px;
  && {
    color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  }
  background: none;

  &:hover {
    background: ${fwVar('surfaceMuted', fwFallback.surfaceMuted)};
  }
`;

/** Styles the search box inside a drill-in list screen. @internal */
export const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.inputGap};
  box-sizing: border-box;
  height: ${FIELD_HEIGHT.s};
  padding: 0 ${spacing.m};
  background: ${fwVar('bg', fwFallback.bg)};
  border: ${spacing.borderWidth} solid ${fwVar('border', fwFallback.border)};
  border-radius: ${FIELD_RADIUS.s};
`;
