import { useState } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';

import styled from '@emotion/styled';
import MuiPopper from '@mui/material/Popper';

import {
  FIELD_HEIGHT,
  FIELD_PADDING_X,
  FIELD_RADIUS,
  panel,
  spacing,
  typography,
} from './design-tokens';
import type { FieldRadius, FieldSize } from './design-tokens';
import {
  fieldPaletteVars,
  fwFallback,
  fwFieldShadow,
  fwVar,
  useFieldPalette,
} from './field-palette';
import type { FilterControlStyle } from './field-palette';

/**
 * The Size and Corner Radius settings the widget's design panel exposes. Re-exported
 * here because `Field` is where the panel's props ultimately land.
 * @internal
 */
export type { FieldRadius, FieldSize } from './design-tokens';

/**
 * The interaction states the design's `State` variant axis carries.
 *
 * `disabled` and `error` are separate props rather than members of this union: they are
 * facts about the control, not a pointer position, and they compose with the rest — an
 * open field can be invalid at the same time.
 * @internal
 */
export type FieldState = 'default' | 'hover' | 'active';

/** State after `state`, `disabled` and live interaction are reconciled. @internal */
export type ResolvedFieldState = FieldState | 'disabled';

/** Props every filter control accepts, because every one of them is a field. @internal */
export type FieldOwnProps = {
  /** Text above the control. Omit for a control that inherits a label elsewhere. */
  label?: ReactNode;
  /** Message under the control. A bare `true` paints the invalid border only. */
  error?: ReactNode | boolean;
  disabled?: boolean;
  /**
   * Pins the visual state instead of deriving it from pointer and focus — for
   * rendering a spec sheet. Leave unset in an application.
   */
  state?: FieldState;
  /** Height of the box. Defaults to `s` — today's 28px field. */
  size?: FieldSize;
  /** Corner roundness, independent of size. Defaults to `s` — today's 4px. */
  radius?: FieldRadius;
  /** Overrides the control's own default width. */
  width?: number | string;
  /** Per-widget colour overrides from the Filter Style design panel. */
  controlStyle?: FilterControlStyle;
  className?: string;
};

type FieldProps = FieldOwnProps & {
  resolvedState: ResolvedFieldState;
  /** Contents of the bordered box. */
  children: ReactNode;
  /** Applied to the bordered box, so the control owns its own interactions. */
  boxProps?: HTMLAttributes<HTMLDivElement>;
  /** The whole box is the trigger — paints the pointer cursor. */
  clickable?: boolean;
  /**
   * Overlay anchored directly under the box. It sits in a zero-height slot between the
   * box and the error line, so the overlay's position never depends on whether the
   * control has a label or a message.
   */
  popover?: ReactNode;
  /**
   * A hover popover under the box — what the control says when the box is too narrow to
   * say it. Its own zero-height anchor, so it neither displaces the error line nor
   * fights the `popover` slot for one.
   */
  tooltip?: ReactNode;
  labelFor?: string;
  /** Id for the error line — wire to the control's `aria-describedby`. */
  errorId?: string;
  style?: CSSProperties;
  /** The control's outer element — what "outside" means for dismissal. */
  rootRef?: Ref<HTMLDivElement>;
  /**
   * The portaled panel's own element. Dismissal needs it: the panel is not inside the
   * control in the DOM, so containment against `rootRef` alone would read a click on the
   * panel as a click outside it.
   */
  popoverRef?: Ref<HTMLDivElement>;
};

/**
 * Which visual state to paint, given what the control knows.
 *
 * Shared by every control so they cannot disagree about it.
 * @param input - The pinned state, plus whether the control is disabled, hovered or open
 * @returns The single state the field should paint
 * @internal
 */
export function resolveFieldState(input: {
  state?: FieldState;
  disabled?: boolean;
  hovered?: boolean;
  active?: boolean;
}): ResolvedFieldState {
  if (input.disabled) {
    return 'disabled';
  }
  if (input.state) {
    return input.state;
  }
  if (input.active) {
    return 'active';
  }
  if (input.hovered) {
    return 'hover';
  }
  return 'default';
}

const toCss = (width: number | string) => (typeof width === 'number' ? `${width}px` : width);

/** Above the dashboard's own popovers, matching the widget's other portaled overlays. */
const POPOVER_Z_INDEX = 1301;

/** The gap between a control and its panel. */
const POPPER_MODIFIERS = [{ name: 'offset', options: { offset: [0, parseInt(panel.offset, 10)] } }];

const Root = styled.div<{ $width?: number | string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
  width: ${({ $width }) => ($width === undefined ? '188px' : toCss($width))};
  max-width: 100%;
  font-family: ${fwVar('fontFamily', fwFallback.fontFamily)};
`;

const Label = styled.div`
  display: flex;
  gap: ${spacing.xs};
  align-items: flex-start;
  max-width: 100%;
  padding-bottom: ${spacing.m};
`;

const LabelText = styled.label`
  overflow: hidden;
  font-size: ${typography.label.size};
  font-weight: ${typography.label.weightAccented};
  line-height: ${typography.label.lineHeight};
  color: ${fwVar('textLabel', fwFallback.textLabel)};
  text-overflow: ellipsis;
  word-break: break-word;
  white-space: nowrap;
`;

const Box = styled.div<{
  $size: FieldSize;
  $radius: FieldRadius;
  $state: ResolvedFieldState;
  $invalid: boolean;
  $clickable: boolean;
}>`
  display: flex;
  gap: ${spacing.inputGap};
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: ${({ $size }) => FIELD_HEIGHT[$size]};
  min-height: ${({ $size }) => FIELD_HEIGHT[$size]};
  padding: ${({ $size }) => ($size === 'xs' ? '4px' : spacing.inputPaddingY)}
    ${({ $size }) => FIELD_PADDING_X[$size]};
  overflow: hidden;
  color: ${({ $state }) =>
    $state === 'disabled'
      ? fwVar('textSecondary', fwFallback.textSecondary)
      : fwVar('textPrimary', fwFallback.textPrimary)};
  background: ${({ $state }) =>
    $state === 'disabled'
      ? fwVar('surfaceMuted', fwFallback.surfaceMuted)
      : fwVar('bg', fwFallback.bg)};
  border: ${spacing.borderWidth} solid
    ${({ $invalid }) =>
      $invalid ? fwVar('error', fwFallback.error) : fwVar('border', fwFallback.border)};
  border-radius: ${({ $radius }) => FIELD_RADIUS[$radius]};
  cursor: ${({ $state, $clickable }) =>
    $state === 'disabled' ? 'not-allowed' : $clickable ? 'pointer' : 'default'};
`;

const TooltipBubble = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: max-content;
  max-width: 320px;
  padding: 6px 10px;
  font-size: ${typography.label.size};
  line-height: 1.45;
  color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  word-break: break-word;
  pointer-events: none;
  background: ${fwVar('bg', fwFallback.bg)};
  border-radius: 4px;
  box-shadow: ${fwFieldShadow};
`;

const ErrorText = styled.p`
  width: max-content;
  min-width: 100%;
  max-width: 188px;
  /* A 4px gap under the box — a defined breath between the field and its message. */
  margin: 4px 0 0;
  font-size: ${typography.paragraph.size};
  line-height: ${typography.paragraph.lineHeight};
  color: ${fwVar('error', fwFallback.error)};
  word-break: break-word;
`;

/**
 * The chrome every filter control shares — label, bordered box, popover and tooltip
 * anchors, error line.
 *
 * Publishes the resolved theme palette as custom properties on its root, which is how
 * the pieces below and every control's own styles get their colour.
 * @param props - Field chrome, the resolved state, and the box contents
 * @returns The control's outer structure
 * @internal
 */
export function Field({
  label,
  error,
  resolvedState,
  size = 's',
  radius = 's',
  width,
  controlStyle,
  className,
  children,
  boxProps,
  clickable,
  popover,
  tooltip,
  labelFor,
  errorId,
  style,
  rootRef,
  popoverRef,
}: FieldProps) {
  const palette = useFieldPalette(controlStyle);
  const invalid = Boolean(error);
  const message = typeof error === 'boolean' ? null : error;
  /**
   * State, not a ref: MUI Popper needs the anchor element on the render that opens the
   * panel, and a ref set during commit would not have triggered one.
   */
  const [boxElement, setBoxElement] = useState<HTMLDivElement | null>(null);

  return (
    <Root
      ref={rootRef}
      className={className}
      $width={width}
      style={{ ...fieldPaletteVars(palette), ...style }}
    >
      {label !== undefined && label !== null && (
        <Label>
          <LabelText htmlFor={labelFor}>{label}</LabelText>
        </Label>
      )}

      <Box
        {...boxProps}
        ref={setBoxElement}
        $size={size}
        $radius={radius}
        $state={resolvedState}
        $invalid={invalid}
        $clickable={Boolean(clickable)}
      >
        {children}
      </Box>

      {/* Portaled, not anchored in place: the widget wraps its body in `overflow: hidden`
          containers only a little taller than the control, which clipped an inline panel
          to a few pixels — and clips a tooltip just as readily. A portal escapes them — but
          it also escapes the palette published on the root, so the custom properties are
          re-applied on each. */}
      {popover && (
        <MuiPopper
          open
          anchorEl={boxElement}
          placement="bottom-start"
          modifiers={POPPER_MODIFIERS}
          style={{ zIndex: POPOVER_Z_INDEX }}
        >
          {/* This element is what "inside the panel" MEANS for dismissal, so it must be the
              panel's box and nothing more — it is given no width of its own, and the Popper's
              own root shrink-wraps, so it ends up exactly as wide as the panel. It used to
              carry the trigger's width as a `min-width`: beside a field wider than its panel
              that left a band of invisible overlay, and a pointer down there counted as
              inside the panel, so the panel would not close. */}
          <div
            ref={popoverRef}
            style={{
              ...fieldPaletteVars(palette),
              fontFamily: palette.fontFamily,
            }}
          >
            {popover}
          </div>
        </MuiPopper>
      )}

      {tooltip && (
        <MuiPopper
          open
          anchorEl={boxElement}
          placement="bottom-start"
          modifiers={POPPER_MODIFIERS}
          style={{ zIndex: POPOVER_Z_INDEX }}
        >
          <div
            style={{
              ...fieldPaletteVars(palette),
              fontFamily: palette.fontFamily,
            }}
          >
            <TooltipBubble data-testid="filter-widget-select-tooltip">{tooltip}</TooltipBubble>
          </div>
        </MuiPopper>
      )}

      {message !== null && message !== undefined && <ErrorText id={errorId}>{message}</ErrorText>}
    </Root>
  );
}

/* The pieces a control drops inside the box. They read the palette off the custom
   properties `Field` publishes, and fall back to the design's own colour so a piece
   rendered outside a `Field` still looks right. */

/** A read-only value or placeholder. Pass `$placeholder` to grey it. @internal */
export const Value = styled.span<{ $placeholder?: boolean }>`
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  font-size: ${typography.label.size};
  font-weight: ${typography.label.weight};
  line-height: ${typography.label.lineHeight};
  color: ${({ $placeholder }) =>
    $placeholder
      ? fwVar('textSecondary', fwFallback.textSecondary)
      : fwVar('textPrimary', fwFallback.textPrimary)};
  text-align: left;
  text-overflow: ellipsis;
  word-break: break-word;
  white-space: nowrap;
`;

/** A real text field, with the same metrics as {@link Value}. @internal */
export const FieldInput = styled.input`
  flex: 1 1 0;
  min-width: 0;
  padding: 0;
  font-family: inherit;
  font-size: ${typography.label.size};
  font-weight: ${typography.label.weight};
  line-height: ${typography.label.lineHeight};
  text-overflow: ellipsis;
  background: transparent;
  border: 0;
  outline: none;

  /*
   * Doubled so a host \`widget input\` / \`.widget-body input\` cannot keep the
   * closed value on the theme ink while the chevron (currentColor on the box)
   * already follows Filter Style primary. \`-webkit-text-fill-color\` is what
   * Chrome paints for input glyphs when a fill is set; \`color\` alone then
   * looks like a no-op.
   */
  && {
    color: ${fwVar('textPrimary', fwFallback.textPrimary)};
    -webkit-text-fill-color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  }

  /* The SDK's accessibility stylesheet rings every focused input
     (\`.csdk-accessible input:focus-visible\`), and a text input matches
     \`:focus-visible\` even when the focus came from a click — so the trigger drew a
     ring on every open, which the design does not have. The selector is doubled to
     outrank that rule; the field's own border carries the focused state, as the design
     intends. Buttons keep the SDK ring: they only match \`:focus-visible\` on keyboard
     focus, which is exactly when it earns its place. */
  &&:focus,
  &&:focus-visible {
    outline: none;
  }

  &::placeholder {
    color: ${fwVar('textSecondary', fwFallback.textSecondary)};
    -webkit-text-fill-color: ${fwVar('textSecondary', fwFallback.textSecondary)};
    opacity: 1;
  }

  &:read-only {
    cursor: pointer;
  }

  &&:disabled {
    color: ${fwVar('textSecondary', fwFallback.textSecondary)};
    -webkit-text-fill-color: ${fwVar('textSecondary', fwFallback.textSecondary)};
    cursor: not-allowed;
  }
`;

/** A 24px icon that is also a hit target — clear, chevron. @internal */
export const IconButton = styled.button`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: inherit;
  cursor: pointer;
  background: none;
  border: 0;
  border-radius: 999px;

  &:hover:not(:disabled) {
    background: ${fwVar('surfaceMuted', fwFallback.surfaceMuted)};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

/** Trailing icons sit flush against each other at the box's end. @internal */
export const Trailing = styled.span`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
`;

/** The `+N` count a trigger's value could not show — set apart by colour alone. @internal */
export const Chip = styled.span`
  flex: 0 0 auto;
  padding: 0 2px 0 0;
  font-size: ${typography.label.size};
  line-height: ${typography.label.lineHeight};
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
  cursor: default;
`;

/** Wraps a glyph that reads a step back — the search icon. @internal */
export const SecondaryGlyph = styled.span`
  display: inline-flex;
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
`;
