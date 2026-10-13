/**
 * Numeric Range control for FilterWidget — a Minimum field, a dual-handle slider
 * and a Maximum field. Ported from the designer's `filter-widget-components`
 * `NumberRangeFilter.tsx` (copied and adapted, not imported), with one deliberate departure:
 * the prototype commits every keystroke and drag frame, this control commits only at its
 * commit points.
 *
 * Commit points — the control has no panel and no footer:
 * - releasing a handle, whether dragged with the pointer or moved with the keyboard;
 * - Enter in a field;
 * - a field's ✕, which clears that end at once.
 *
 * A handle released at its own edge of the data leaves that end empty — no limit — rather than
 * storing the edge number.
 *
 * Nothing publishes during a drag or per keystroke, and a pair with an error publishes nothing.
 * Leaving a field without Enter reverts it to the applied value — the field never shows an
 * unapplied value — except an entry refused on Enter, which stays in view, flagged, until edited.
 *
 * The slider spans the column's own data, `dataMin…dataMax`. When the column has one value, or
 * no data, the slider is disabled and the fields stay live.
 * @internal
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import { type Attribute, type Filter } from '@sisense/sdk-data';

import { applyOpacity } from '@/shared/utils/color/color-interpolation';

import { FIELD_HEIGHT, FIELD_PADDING_X, spacing, typography } from './design-tokens.js';
import type { FieldSize } from './design-tokens.js';
import { fieldPaletteVars, fwFallback, fwVar, useFieldPalette } from './field-palette.js';
import { Field, FieldInput, IconButton, resolveFieldState, Trailing } from './field.js';
import type { FieldOwnProps } from './field.js';
import { Icon } from './icons.js';
import {
  cleanNumber,
  emptyNumberRange,
  endNumber,
  filterToNumberRange,
  FINE_DRAG_FACTOR,
  FINE_SIGNIFICANT_DIGITS,
  hasNumberRangeErrors,
  hasSliderSpan,
  isSameNumberRange,
  keyStep,
  type NumberRangeEnd,
  numberRangeErrors,
  numberRangeToFilter,
  type NumberRangeValue,
  sliderStep,
  snapDrag,
  withNumberRangeEnd,
} from './number-range.js';
import { useFieldId } from './use-field-id.js';
import { useHover } from './use-hover.js';

/** The control's full width; narrower than this it stacks. */
const RANGE_WIDTH = 400;
/** Stacked, each field grows up to this. */
const END_MAX = 200;
/** Field width reserves room for six digits — or the data's widest bound when longer. */
const FIELD_CHARS = 6;
/** The hover ✕ slot, held even when hidden so it never shoves the value. */
const CLEAR_SLOT = 24 + 4;
/** Approximate advance of one digit at the control's 13px type. */
const DIGIT_WIDTH = 8;
/** The handle dot, fixed at every Size step. */
const THUMB = 12;
/** How long an interim host filter is held back while the commit's echo is awaited. */
const ECHO_WAIT_MS = 1000;
/** The keys that move a focused handle. */
const SLIDER_KEYS = new Set([
  'ArrowRight',
  'ArrowUp',
  'ArrowLeft',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
]);

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** @internal */
export type NumberRangeFilterProps = FieldOwnProps & {
  /** The widget's numeric attribute. */
  attribute: Attribute;
  /** The linked filter — `between`, `≥`, `≤`, or `null` for none. */
  filter?: Filter | null;
  /** Publishes a committed pair; `null` clears the filter. */
  onFilterUpdate?: (filter: Filter | null) => void;
  /** The column's low edge, when known. */
  dataMin?: number;
  /** The column's high edge, when known. */
  dataMax?: number;
  /** How many distinct values the column holds, when known — tells whole-number data apart. */
  dataCount?: number;
  /**
   * Below this width (px) the control stacks — the slider moves under the two fields. Defaults
   * to the control's full width; a host that pads the control passes the width the control
   * gets inside the narrowest widget that still shows one line.
   */
  stackBelow?: number;
  id?: string;
};

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  max-width: ${RANGE_WIDTH}px;
  font-family: ${fwVar('fontFamily', fwFallback.fontFamily)};
`;

const Label = styled.label`
  overflow: hidden;
  padding-bottom: ${spacing.m};
  font-size: ${typography.label.size};
  font-weight: ${typography.label.weightAccented};
  line-height: ${typography.label.lineHeight};
  color: ${fwVar('textLabel', fwFallback.textLabel)};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* One line: field — slider — field. Stacked: the two fields with a dash, the slider under them. */
const Row = styled.div<{ $stacked: boolean }>`
  display: flex;
  flex-wrap: ${({ $stacked }) => ($stacked ? 'wrap' : 'nowrap')};
  align-items: center;
  column-gap: ${({ $stacked }) => ($stacked ? '0' : '16px')};
  row-gap: ${spacing.m};
  width: 100%;
`;

const FieldCell = styled.span<{ $stacked: boolean; $basis: number }>`
  flex: ${({ $stacked, $basis }) => ($stacked ? '1 1 0' : `0 1 ${$basis}px`)};
  min-width: 0;
  max-width: ${({ $stacked }) => ($stacked ? `${END_MAX}px` : 'none')};
`;

const Dash = styled.span<{ $size: FieldSize }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: ${({ $size }) => FIELD_HEIGHT[$size]};
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
  user-select: none;
`;

/* The slider's own custom properties, set on the root from the resolved palette: the band and
   handles in 80% ink — darker than the grey track, lighter than full ink —, the track in 15%
   ink, and the soft halo of a focused handle, from the brand hover colour. The track takes
   its own ink-derived variable rather than the field border role so recolouring or switching
   off the fields' border never touches the slider. */
const SLIDER_VAR = '--csdk-fw-number-range-slider';
const SLIDER_TRACK_VAR = '--csdk-fw-number-range-slider-track';
const HALO_VAR = '--csdk-fw-number-range-halo';

/* Stacked, the slider takes its own row at full width, inset by a handle radius so a handle at
   either end stays inside. In line it fills the middle and never gets narrower than a third of
   the row (less the two 16px gaps), 48px at least: on a narrow row the fields shrink first. */
const SliderCell = styled.div<{ $stacked: boolean; $size: FieldSize; $off: boolean }>`
  display: flex;
  flex: ${({ $stacked }) => ($stacked ? '1 0 100%' : '1 1 0')};
  align-items: center;
  order: ${({ $stacked }) => ($stacked ? 1 : 0)};
  min-width: ${({ $stacked }) => ($stacked ? '0' : 'max(48px, calc((100% - 32px) / 3))')};
  height: ${({ $size }) => FIELD_HEIGHT[$size]};
  padding: 0 ${({ $stacked }) => ($stacked ? `${THUMB / 2}px` : '0')};
  box-sizing: border-box;
  opacity: ${({ $off }) => ($off ? 0.5 : 1)};
`;

const Track = styled.div<{ $dragging: boolean; $off: boolean }>`
  position: relative;
  width: 100%;
  height: 2px;
  background: var(${SLIDER_TRACK_VAR}, ${applyOpacity(fwFallback.textPrimary, 0.15)});
  border-radius: 999px;
  cursor: ${({ $dragging }) => ($dragging ? 'ew-resize' : 'default')};
  touch-action: none;
  pointer-events: ${({ $off }) => ($off ? 'none' : 'auto')};
`;

const Band = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  background: var(${SLIDER_VAR}, ${fwVar('textPrimary', fwFallback.textPrimary)});
  border-radius: 999px;
`;

const Thumb = styled.div<{ $dragging: boolean; $on: boolean }>`
  position: absolute;
  top: 50%;
  z-index: ${({ $on }) => ($on ? 2 : 1)};
  width: ${THUMB}px;
  height: ${THUMB}px;
  border-radius: 50%;
  background: var(${SLIDER_VAR}, ${fwVar('textPrimary', fwFallback.textPrimary)});
  transform: translate(-50%, -50%);
  cursor: ${({ $dragging }) => ($dragging ? 'ew-resize' : 'grab')};
  outline: none;

  /* A background sub-ring lifts the handle off the band, then a brand-hover ring and a soft
     halo make the focused handle unmistakable for keyboard users. */
  &:focus-visible {
    box-shadow: 0 0 0 2px ${fwVar('bg', fwFallback.bg)},
      0 0 0 4px ${fwVar('buttonPrimaryHover', fwFallback.buttonPrimaryHover)},
      0 0 8px 3px var(${HALO_VAR}, transparent);
  }
`;

const ErrorLine = styled.p`
  margin: ${spacing.xs} 0 0;
  font-size: ${typography.label.size};
  line-height: ${typography.label.lineHeight};
  color: ${fwVar('error', fwFallback.error)};
  word-break: break-word;
`;

const TrailingEnd = styled(Trailing)`
  margin-inline-start: auto;
`;

type EndFieldProps = {
  end: NumberRangeEnd;
  inputId: string;
  text: string;
  placeholder: string;
  invalid: boolean;
  errorId?: string;
  disabled?: boolean;
  state?: FieldOwnProps['state'];
  size: FieldSize;
  radius?: FieldOwnProps['radius'];
  controlStyle?: FieldOwnProps['controlStyle'];
  onChangeText: (text: string) => void;
  onEnter: () => void;
  onLeave: () => void;
  onClear: () => void;
};

/**
 * One end's bordered field: a number typed as text (`inputMode="decimal"`, so a non-number can
 * land and be flagged), and its own hover ✕.
 * @param props - The end, its text, its state and its handlers.
 * @returns The end's bordered field.
 */
function NumberRangeEndField(props: EndFieldProps) {
  const {
    end,
    inputId,
    text,
    placeholder,
    invalid,
    errorId,
    disabled,
    state,
    size,
    radius,
    controlStyle,
    onChangeText,
    onEnter,
    onLeave,
    onClear,
  } = props;
  const { t } = useTranslation();
  const { hovered, handlers } = useHover(disabled);
  const [focused, setFocused] = useState(false);
  const resolvedState = resolveFieldState({ state, disabled, hovered, active: focused });
  const hasValue = text !== '';
  const showClear = hasValue && !disabled && (hovered || focused || state === 'hover');
  const label = t(
    end === 'min' ? 'filterWidget.numberRange.minimum' : 'filterWidget.numberRange.maximum',
  );

  return (
    <Field
      resolvedState={resolvedState}
      size={size}
      radius={radius}
      width="100%"
      controlStyle={controlStyle}
      error={invalid || undefined}
      boxProps={{
        ...handlers,
        'data-testid': `filter-widget-number-range-${end}-field`,
      }}
    >
      <FieldInput
        id={inputId}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        data-testid={`filter-widget-number-range-${end}`}
        disabled={disabled}
        value={text}
        placeholder={placeholder}
        onChange={(event) => onChangeText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onEnter();
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onLeave();
        }}
      />
      <TrailingEnd>
        {hasValue && !disabled && (
          <IconButton
            type="button"
            style={showClear ? undefined : { visibility: 'hidden' }}
            tabIndex={-1}
            data-testid={`filter-widget-number-range-${end}-clear`}
            aria-label={t('filterWidget.numberRange.clear', { field: label })}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
          >
            <Icon name="closeSmall" />
          </IconButton>
        )}
      </TrailingEnd>
    </Field>
  );
}

/**
 * @param props - Attribute, linked filter, the column's data edges and the publish callback.
 * @returns The Minimum / slider / Maximum control.
 * @internal
 */
export function NumberRangeFilter(props: NumberRangeFilterProps) {
  const {
    attribute,
    filter = null,
    onFilterUpdate,
    dataMin,
    dataMax,
    dataCount,
    stackBelow = RANGE_WIDTH,
    id,
    label,
    disabled,
    state,
    size = 's',
    radius,
    controlStyle,
    className,
  } = props;
  const { t } = useTranslation();
  const palette = useFieldPalette(controlStyle);
  const rootStyle = useMemo<CSSProperties>(
    () => ({
      ...fieldPaletteVars(palette),
      ...Object.fromEntries([
        [SLIDER_VAR, applyOpacity(palette.textPrimary, 0.8)],
        [SLIDER_TRACK_VAR, applyOpacity(palette.textPrimary, 0.15)],
        [HALO_VAR, applyOpacity(palette.buttonPrimaryHover, 0.55)],
      ]),
    }),
    [palette],
  );
  const fieldId = useFieldId(id);
  const errorId = `${fieldId}-error`;
  const labelId = `${fieldId}-label`;
  const hasLabel = label !== undefined && label !== null;

  const sliderOn = !disabled && hasSliderSpan(dataMin, dataMax);
  /* Until the column's bounds arrive there is nowhere to put a handle; drawn at the edges, a set
     end would jump to its place a moment later. The bare track shows meanwhile. */
  const boundsKnown = dataMin !== undefined && dataMax !== undefined;
  /* The edges, read only while the slider is on — `sliderOn` guarantees both are known. */
  const lo = dataMin ?? 0;
  const hi = dataMax ?? 0;
  const span = sliderOn ? hi - lo : 1;
  /* The smallest move: whole steps for whole-number data, finer for a column of fractions. */
  const step = sliderOn ? sliderStep(lo, hi, dataCount) : 1;

  /* ── Applied / committed / draft ────────────────────────────────────────────
     `applied` is what the linked filter says. `committed` is the last pair this control
     published (or the applied one) — what a field reverts to, held locally because the host's
     filter round-trip lands a render later. `draft` is what the fields and handles show. */
  const applied = useMemo(() => filterToNumberRange(filter), [filter]);
  const [trackedApplied, setTrackedApplied] = useState(applied);
  const [committed, setCommitted] = useState(applied);
  const [draft, setDraftState] = useState(applied);
  /* Which end holds an entry Enter refused — kept in view when the field is left. A ref, not
     state: nothing renders from it, and a blur in the same tick as the refused Enter must see it. */
  const rejectedRef = useRef<Record<NumberRangeEnd, boolean>>({ min: false, max: false });
  const draftRef = useRef(draft);
  const committedRef = useRef(committed);
  /* A pair this control published and is waiting to see come back, with the pair it replaced.
     On the way back some hosts pass through an interim filter — none at all, or the previous
     one — for a render or two; adopting it would snap the handles to the edges and back. */
  const [awaiting, setAwaiting] = useState<{
    next: NumberRangeValue;
    before: NumberRangeValue;
  } | null>(null);
  if (!isSameNumberRange(applied, trackedApplied)) {
    setTrackedApplied(applied);
    const echo = awaiting !== null && isSameNumberRange(applied, awaiting.next);
    const interim =
      awaiting !== null &&
      !echo &&
      (isSameNumberRange(applied, emptyNumberRange()) ||
        isSameNumberRange(applied, awaiting.before));
    if (!interim) {
      /* The commit landing, or a change from outside: the host's filter wins. */
      setAwaiting(null);
      setCommitted(applied);
      setDraftState(applied);
    }
  }

  /* The refs follow the state after each render, so a handler reads what is on screen even when
     the host's filter moved it during render. Handlers also write them directly, so two events
     inside one render see each other. */
  useLayoutEffect(() => {
    draftRef.current = draft;
    committedRef.current = committed;
  }, [draft, committed]);

  /* A filter that moved from outside replaces whatever was refused. */
  useLayoutEffect(() => {
    rejectedRef.current = { min: false, max: false };
  }, [trackedApplied]);

  /* The interim window is short. A host that answers a commit with an interim filter and no echo
     within it meant that filter — a commit it reverted, or a clear — so the latest one is taken,
     and the fields never keep showing a pair the dashboard is not filtered by. */
  useEffect(() => {
    if (awaiting === null || isSameNumberRange(trackedApplied, awaiting.next)) return undefined;
    const timer = setTimeout(() => {
      setAwaiting(null);
      setCommitted(trackedApplied);
      setDraftState(trackedApplied);
    }, ECHO_WAIT_MS);
    return () => clearTimeout(timer);
  }, [awaiting, trackedApplied]);

  const setDraft = useCallback((next: NumberRangeValue) => {
    draftRef.current = next;
    setDraftState(next);
  }, []);

  /** Publishes a pair if it is valid and new. @returns whether the pair was accepted. */
  const commit = useCallback(
    (next: NumberRangeValue): boolean => {
      if (hasNumberRangeErrors(numberRangeErrors(next))) return false;
      if (isSameNumberRange(next, committedRef.current)) return true;
      setAwaiting({ next, before: committedRef.current });
      committedRef.current = next;
      setCommitted(next);
      const config = filter?.config ? { ...filter.config } : undefined;
      onFilterUpdate?.(numberRangeToFilter(attribute, next, config));
      return true;
    },
    [attribute, filter, onFilterUpdate],
  );

  /** The moved end over the committed other end — a handle never publishes unapplied text. */
  const commitEnd = useCallback(
    (end: NumberRangeEnd) =>
      commit(withNumberRangeEnd(committedRef.current, end, draftRef.current[end])),
    [commit],
  );

  // ── Fields ──────────────────────────────────────────────────────────────
  const changeText = (end: NumberRangeEnd, text: string) => {
    rejectedRef.current = { ...rejectedRef.current, [end]: false };
    setDraft(withNumberRangeEnd(draftRef.current, end, text));
  };
  const enter = (end: NumberRangeEnd) => {
    const accepted = commit(draftRef.current);
    if (!accepted) rejectedRef.current = { ...rejectedRef.current, [end]: true };
  };
  const leave = (end: NumberRangeEnd) => {
    if (rejectedRef.current[end]) return;
    const kept = committedRef.current[end];
    if (draftRef.current[end] !== kept) setDraft(withNumberRangeEnd(draftRef.current, end, kept));
  };
  const clearEnd = (end: NumberRangeEnd) => {
    rejectedRef.current = { ...rejectedRef.current, [end]: false };
    setDraft(withNumberRangeEnd(draftRef.current, end, ''));
    commit(withNumberRangeEnd(committedRef.current, end, ''));
  };

  // ── Slider ──────────────────────────────────────────────────────────────
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragEnd, setDragEnd] = useState<NumberRangeEnd | null>(null);
  const [lastEnd, setLastEnd] = useState<NumberRangeEnd | null>(null);
  const fineAnchor = useRef<{ x: number; value: number } | null>(null);
  /* Whether the pointer moved since a handle was pressed — a press alone changes nothing. */
  const movedRef = useRef(false);

  const minNum = endNumber(draft.min);
  const maxNum = endNumber(draft.max);
  const frac = (v: number) => clamp((v - (dataMin ?? 0)) / span, 0, 1);
  const minFrac = sliderOn && minNum !== null ? frac(minNum) : 0;
  const maxFrac = sliderOn && maxNum !== null ? frac(maxNum) : 1;

  /* Places one end, clamped to the data and to the other handle so the pair never crosses. */
  const placeEnd = (end: NumberRangeEnd, value: number) => {
    if (!sliderOn) return;
    const otherMin = endNumber(draftRef.current.min);
    const otherMax = endNumber(draftRef.current.max);
    let v = clamp(value, lo, hi);
    if (end === 'min') v = Math.min(v, otherMax ?? hi);
    else v = Math.max(v, otherMin ?? lo);
    /* A handle at its own edge of the data means no limit on that end: the end stays empty, so
       the filter keeps it open and rows added later beyond today's edge still pass. Only a value
       typed into the field is stored as the edge number. */
    const atEdge = end === 'min' ? v <= lo : v >= hi;
    setDraft(withNumberRangeEnd(draftRef.current, end, atEdge ? '' : String(v)));
  };

  const moveTo = (end: NumberRangeEnd, clientX: number, fine: boolean) => {
    const rect = trackRef.current?.getBoundingClientRect();
    const width = rect?.width || 1;
    let raw: number;
    if (fine) {
      if (!fineAnchor.current) {
        const current =
          endNumber(draftRef.current[end]) ?? (end === 'min' ? dataMin : dataMax) ?? 0;
        fineAnchor.current = { x: clientX, value: current };
      }
      raw =
        fineAnchor.current.value +
        ((clientX - fineAnchor.current.x) / width) * (span / FINE_DRAG_FACTOR);
    } else {
      fineAnchor.current = null;
      raw = lo + clamp((clientX - (rect?.left ?? 0)) / width, 0, 1) * span;
    }
    /* The edge is judged before rounding: a column edge off the rounding grid (950123 at a step
       of 100) would otherwise round inside the data, so a handle pulled to the end would store
       950100 and hide the rows above it instead of leaving the end open. */
    if (raw <= lo) placeEnd(end, lo);
    else if (raw >= hi) placeEnd(end, hi);
    else placeEnd(end, fine ? snapDrag(raw, step, FINE_SIGNIFICANT_DIGITS) : snapDrag(raw, step));
  };

  const onTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!sliderOn) return;
    /* Only a press on a handle drags — a press on bare track does nothing. */
    const thumb = (event.target as HTMLElement).closest('[data-end]');
    if (!thumb) return;
    event.preventDefault();
    const end = thumb.getAttribute('data-end') as NumberRangeEnd;
    (thumb as HTMLElement).focus();
    trackRef.current?.setPointerCapture?.(event.pointerId);
    setDragEnd(end);
    setLastEnd(end);
    /* Pressing only takes hold of the handle: the value moves with the pointer, not to it, so a
       click without a drag leaves the end — a typed edge value included — exactly as it was.
       A Shift press anchors the fine mode here, at the value the handle already holds. */
    movedRef.current = false;
    fineAnchor.current = event.shiftKey
      ? {
          x: event.clientX,
          value: endNumber(draftRef.current[end]) ?? (end === 'min' ? lo : hi),
        }
      : null;
  };
  const onTrackPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragEnd) return;
    movedRef.current = true;
    moveTo(dragEnd, event.clientX, event.shiftKey);
  };
  const onTrackPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragEnd) return;
    trackRef.current?.releasePointerCapture?.(event.pointerId);
    fineAnchor.current = null;
    setDragEnd(null);
    if (movedRef.current) commitEnd(dragEnd);
  };

  const onThumbKeyDown = (end: NumberRangeEnd) => (event: ReactKeyboardEvent) => {
    if (!sliderOn || !SLIDER_KEYS.has(event.key)) return;
    event.preventDefault();
    const here = endNumber(draftRef.current[end]) ?? (end === 'min' ? lo : hi);
    const big = Math.max(step, Math.round(span / 10 / step) * step);
    const small = keyStep(here, step);
    const moves: Record<string, number> = {
      ArrowRight: cleanNumber(here + small),
      ArrowUp: cleanNumber(here + small),
      ArrowLeft: cleanNumber(here - small),
      ArrowDown: cleanNumber(here - small),
      PageUp: cleanNumber(here + big),
      PageDown: cleanNumber(here - big),
      Home: lo,
      End: hi,
    };
    setLastEnd(end);
    placeEnd(end, moves[event.key]);
  };
  /* A key move publishes on the key's release — once per press, once after a held key. */
  const onThumbKeyUp = (end: NumberRangeEnd) => (event: ReactKeyboardEvent) => {
    if (!sliderOn || !SLIDER_KEYS.has(event.key)) return;
    commitEnd(end);
  };

  // ── Layout ──────────────────────────────────────────────────────────────
  const rootRef = useRef<HTMLDivElement>(null);
  const [rootWidth, setRootWidth] = useState(0);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const read = () => setRootWidth(root.getBoundingClientRect().width);
    read();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(read);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  const stacked = rootWidth > 0 && rootWidth < stackBelow - 0.5;
  /* Both fields share one width, sized by the data's bounds — never by what is typed, so a long
     entry cannot widen the field and shove the slider. */
  const fieldBasis =
    Math.max(FIELD_CHARS, String(dataMin ?? '').length, String(dataMax ?? '').length) *
      DIGIT_WIDTH +
    parseInt(FIELD_PADDING_X[size], 10) * 2 +
    CLEAR_SLOT;

  // ── Errors ──────────────────────────────────────────────────────────────
  const errors = numberRangeErrors(draft);
  const errorMessage =
    errors.min || errors.max
      ? t('filterEditor.validationErrors.invalidNumber')
      : errors.order
      ? t('filterWidget.controls.rangeOrderError')
      : null;
  const minInvalid = Boolean(errors.min || errors.order);
  const maxInvalid = Boolean(errors.max || errors.order);

  const placeholderMin = dataMin === undefined ? '' : String(dataMin);
  const placeholderMax = dataMax === undefined ? '' : String(dataMax);

  const field = (end: NumberRangeEnd) => (
    <FieldCell $stacked={stacked} $basis={fieldBasis}>
      <NumberRangeEndField
        end={end}
        inputId={end === 'min' ? fieldId : `${fieldId}-max`}
        text={draft[end]}
        placeholder={end === 'min' ? placeholderMin : placeholderMax}
        invalid={end === 'min' ? minInvalid : maxInvalid}
        errorId={errorMessage ? errorId : undefined}
        disabled={disabled}
        state={state}
        size={size}
        radius={radius}
        controlStyle={controlStyle}
        onChangeText={(text) => changeText(end, text)}
        onEnter={() => enter(end)}
        onLeave={() => leave(end)}
        onClear={() => clearEnd(end)}
      />
    </FieldCell>
  );

  const thumb = (end: NumberRangeEnd, fraction: number, value: number | null) => (
    <Thumb
      data-end={end}
      data-testid={`filter-widget-number-range-${end}-handle`}
      role="slider"
      tabIndex={sliderOn ? 0 : -1}
      aria-label={t(
        end === 'min' ? 'filterWidget.numberRange.minimum' : 'filterWidget.numberRange.maximum',
      )}
      aria-valuemin={dataMin}
      aria-valuemax={dataMax}
      aria-valuenow={value ?? (end === 'min' ? dataMin : dataMax)}
      aria-valuetext={value === null ? t('filterWidget.numberRange.notSet') : String(value)}
      aria-disabled={!sliderOn || undefined}
      $dragging={dragEnd === end}
      $on={lastEnd === end}
      style={{ left: `${fraction * 100}%`, visibility: boundsKnown ? undefined : 'hidden' }}
      onKeyDown={onThumbKeyDown(end)}
      onKeyUp={onThumbKeyUp(end)}
    />
  );

  return (
    <Root
      ref={rootRef}
      className={className}
      style={rootStyle}
      data-testid="filter-widget-number-range"
      data-stacked={stacked || undefined}
    >
      {hasLabel && (
        <Label id={labelId} htmlFor={fieldId}>
          {label}
        </Label>
      )}
      <Row
        $stacked={stacked}
        role="group"
        aria-labelledby={hasLabel ? labelId : undefined}
        data-testid="filter-widget-number-range-row"
      >
        {field('min')}
        {stacked && (
          <Dash $size={size} aria-hidden="true">
            –
          </Dash>
        )}
        <SliderCell
          $stacked={stacked}
          $size={size}
          $off={!sliderOn}
          data-testid="filter-widget-number-range-slider"
          data-disabled={!sliderOn || undefined}
        >
          <Track
            ref={trackRef}
            $dragging={dragEnd !== null}
            $off={!sliderOn}
            onPointerDown={onTrackPointerDown}
            onPointerMove={onTrackPointerMove}
            onPointerUp={onTrackPointerUp}
            onPointerCancel={onTrackPointerUp}
          >
            <Band
              style={{
                left: `${Math.min(minFrac, maxFrac) * 100}%`,
                width: `${Math.abs(maxFrac - minFrac) * 100}%`,
                visibility: boundsKnown ? undefined : 'hidden',
              }}
            />
            {thumb('min', minFrac, minNum)}
            {thumb('max', maxFrac, maxNum)}
          </Track>
        </SliderCell>
        {field('max')}
      </Row>
      {errorMessage && (
        <ErrorLine id={errorId} data-testid="filter-widget-number-range-error">
          {errorMessage}
        </ErrorLine>
      )}
    </Root>
  );
}
