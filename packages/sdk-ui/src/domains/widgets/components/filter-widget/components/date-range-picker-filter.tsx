/**
 * Range control for FilterWidget — two SEPARATE fields, From and To, each its own bordered
 * box with its own calendar-glyph button, joined by a dash that sits outside both boxes.
 * They share ONE calendar panel, anchored at a fixed spot under the From field so pointing
 * it at the other end never repositions it — ported from the prototype's
 * `DateRangeSplitFilter`/`DateInput` pair, not the single-shared-box `DateRangeField`
 * variant that design rejected.
 *
 * There is exactly ONE `open` boolean, owned here, not by either field: switching the
 * active end only ever moves `activeEnd` while `open` stays true, so the panel's mount
 * never toggles as focus hands off between the two inputs — no close/reopen flicker.
 * Dismissal (outside click, Escape, focus leaving entirely) is watched at the ROW, not
 * per field, so moving from one field's trigger to the other's — or into the portaled
 * panel — never counts as "outside".
 *
 * A click or a keystroke on either field opens the shared panel, Enter is the keyboard
 * twin of Apply, and an entry refused on Apply/Enter stays in view under the closed
 * fields, flagged, until the panel reopens and re-seeds the draft from it.
 *
 * The panel underneath carries the same Clear / Cancel / Apply footer every other filter
 * panel does (`filter-widget-panel.tsx`), assembled the way `DatePickerFilter`'s own
 * `panelShell` assembles it — not `ConditionFilterShell`'s Selector-and-drill shell, which
 * has no counterpart here: Range has no operator to pick.
 *
 * An unset, unfocused end shows the idle word `From`/`To` rather than the bare `MM/DD/YYYY`
 * template — the prototype's own `MaskedDateInput` convention (`placeholder`), not a
 * Range-only extension: Calendar's single-date `DateEntry` simply omits it and keeps the
 * plain format-only empty state.
 * @internal
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  Ref,
} from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import { type Attribute, type Filter } from '@sisense/sdk-data';

import { focusGridFromInput, panelArrowNav, useRestoreFocusOnClose } from './calendar-a11y.js';
import { DateRangeCalendarGrid } from './date-range-calendar-grid.js';
import type { DateRangePickResult } from './date-range-calendar-grid.js';
import { formatDateInput, parseDateInput } from './date-text.js';
import type { DateMask } from './date-text.js';
import { FIELD_HEIGHT, spacing, typography } from './design-tokens.js';
import { fwFallback, fwVar } from './field-palette.js';
import { Field, IconButton, resolveFieldState, Trailing } from './field.js';
import type { FieldOwnProps, FieldRadius, FieldSize } from './field.js';
import {
  Actions,
  ClearButton,
  Foot,
  Panel,
  PrimaryButton,
  SecondaryButton,
} from './filter-widget-panel.js';
import { Icon } from './icons.js';
import { MaskedDateInput } from './masked-date-input.js';
import {
  emptyRangeDraft,
  filterToRangeDraft,
  isRangeDraftUsable,
  judgeRangeEnd,
  type RangeDraft,
  rangeDraftToFilter,
  type RangeEnd,
  type RangeEntryProblem,
  rangeInversionMessageKey,
  withRangeEnd,
} from './range-date.js';
import { useDateMask } from './use-date-mask.js';
import { useDismiss } from './use-dismiss.js';
import { useFieldId } from './use-field-id.js';
import { useHover } from './use-hover.js';

const FROM_KEY = 'filterWidget.dateRange.from';
const TO_KEY = 'filterWidget.dateRange.to';

/** @internal */
export type DateRangePickerFilterProps = FieldOwnProps & {
  attribute: Attribute;
  filter?: Filter | null;
  onFilterUpdate?: (filter: Filter | null) => void;
  id?: string;
  /** Injectable so a test renders the same on any day. */
  today?: Date;
  earliestData?: Date;
  latestData?: Date;
};

/* Column wrapper: the optional label sits above the two-field row, the way every other
   filter control titles its box — matched here since the pair is two Fields, not one. */
const Root = styled.div<{ $width?: number | string }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 100%;
  width: ${({ $width }) =>
    $width === undefined ? '100%' : typeof $width === 'number' ? `${$width}px` : $width};
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

/* Two independent fields laid side by side. Top-aligned, not centred: an error line under
   one end must not shove that box out of line with the other. */
const Row = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
`;

/* Each end is a field of 140 to 188 — laid out at 140, grown to 188 when the row has room;
   the pair is 304 to 400 in all, matching the prototype's `DateRangeSplitFilter`. */
const Cell = styled.span`
  flex: 1 1 140px;
  min-width: 0;
  max-width: 188px;
`;

/* Centred against the boxes by owning their exact height, since the top-aligned row no
   longer centres it. Sits OUTSIDE both boxes — its own 24px width, not a row gap, is the
   whole span between the two. */
const Dash = styled.span<{ $size: FieldSize }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: ${(p) => FIELD_HEIGHT[p.$size]};
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
  user-select: none;
`;

/* Nothing in a field's own box stretches, so the trailing glyphs pin themselves to its
   end — same reasoning as `DateEntry`'s own `TrailingEnd`, not reused directly since it is
   not exported. */
const TrailingEnd = styled(Trailing)`
  margin-inline-start: auto;
`;

function endMessage(
  t: (key: string, options?: Record<string, unknown>) => string,
  mask: DateMask,
  problem: RangeEntryProblem,
): string {
  if (problem === 'inverted') return '';
  if (problem === 'malformed') {
    return t('filterWidget.calendar.formatError', { format: mask.template });
  }
  return t('filterWidget.calendar.nonexistent');
}

/** @internal */
type RangeEndFieldProps = {
  end: RangeEnd;
  fieldId: string;
  mask: DateMask;
  text: string;
  fieldError: FieldOwnProps['error'];
  disabled?: boolean;
  state?: FieldOwnProps['state'];
  size?: FieldSize;
  radius?: FieldRadius;
  controlStyle?: FieldOwnProps['controlStyle'];
  /** Whether the shared panel is open AND currently pointed at this end. */
  isOpenHere: boolean;
  inputRef: (element: HTMLInputElement | null) => void;
  onChangeText: (text: string) => void;
  onEnter: () => void;
  onFieldBlur: () => void;
  onClear: () => void;
  onOpenChange: (open: boolean) => void;
  /** The shared panel — passed only to the field it is anchored under (fixed spot). */
  popover?: ReactNode;
  /** The panel's portaled wrapper, so the row-level dismiss can tell it apart from "outside". */
  popoverRef?: Ref<HTMLDivElement>;
};

/**
 * One end's own bordered field — its masked input, its own ✕ clear icon and its own
 * calendar-glyph button. A `Field` in its own right (own border, own hover, own focus),
 * not a child of a shared box: the two ends look and behave like two independent inputs,
 * joined only by the dash between them and the one panel they both point at.
 * @param props - The end's own text, the shared mask, and its handlers.
 * @returns The end's bordered field.
 * @internal
 */
function RangeEndField(props: RangeEndFieldProps) {
  const {
    end,
    fieldId,
    mask,
    text,
    fieldError,
    disabled,
    state,
    size,
    radius,
    controlStyle,
    isOpenHere,
    inputRef,
    onChangeText,
    onEnter,
    onFieldBlur,
    onClear,
    onOpenChange,
    popover,
    popoverRef,
  } = props;
  const { t } = useTranslation();
  const isFrom = end === 'from';
  const { hovered, handlers: hoverHandlers } = useHover(disabled);
  const [focusWithin, setFocusWithin] = useState(false);
  const localInputRef = useRef<HTMLInputElement | null>(null);
  const setInputRef = (element: HTMLInputElement | null) => {
    localInputRef.current = element;
    inputRef(element);
  };

  const active = focusWithin || isOpenHere;
  const resolvedState = resolveFieldState({ state, disabled, hovered, active });
  const pointerOver = hovered || state === 'hover';
  const hasValue = text !== '';
  const showClear = hasValue && !disabled && (pointerOver || active);

  return (
    <Field
      resolvedState={resolvedState}
      size={size}
      radius={radius}
      width="100%"
      controlStyle={controlStyle}
      error={fieldError}
      errorId={`${fieldId}-error`}
      clickable
      popover={popover}
      popoverRef={popoverRef}
      boxProps={{
        ...hoverHandlers,
        'data-testid': isFrom
          ? 'filter-widget-date-range-from-trigger'
          : 'filter-widget-date-range-to-trigger',
        /* Keep focus where it is when the box's own padding is pressed, so the click below
           can decide what to do with it. */
        onMouseDown: (event) => {
          if (!(event.target as HTMLElement).closest('input,button')) event.preventDefault();
        },
        /* A click anywhere on this field's own box opens the shared panel pointed at this
           end and takes the caret. Open-only, not toggle: a second click on an already-open
           field keeps it open — dismissal (or the calendar glyph) closes it. */
        onClick: (event) => {
          if (disabled) return;
          if ((event.target as HTMLElement).closest('button')) return;
          localInputRef.current?.focus();
          onOpenChange(true);
        },
      }}
      rootProps={{
        onFocus: () => setFocusWithin(true),
        onBlur: (event) => {
          if (event.currentTarget.contains(event.relatedTarget)) return;
          setFocusWithin(false);
        },
      }}
    >
      <MaskedDateInput
        ref={setInputRef}
        id={fieldId}
        mask={mask}
        value={text}
        placeholder={t(isFrom ? FROM_KEY : TO_KEY)}
        onChange={onChangeText}
        onEnter={onEnter}
        onBlur={onFieldBlur}
        ariaLabel={t(isFrom ? FROM_KEY : TO_KEY)}
        describedBy={
          fieldError !== undefined && fieldError !== null && typeof fieldError !== 'boolean'
            ? `${fieldId}-error`
            : undefined
        }
        invalid={Boolean(fieldError)}
        disabled={disabled}
        dataTestId={isFrom ? 'filter-widget-date-range-from' : 'filter-widget-date-range-to'}
      />
      <TrailingEnd>
        {/* Mounted whenever there is a value, shown on hover/active: toggling visibility
            instead of existence keeps the slot's width, so the calendar glyph never jumps
            when the clear affordance appears (the prototype's own `DateInput` convention). */}
        {hasValue && !disabled && (
          <IconButton
            type="button"
            style={showClear ? undefined : { visibility: 'hidden' }}
            tabIndex={-1}
            data-testid={
              isFrom ? 'filter-widget-date-range-from-clear' : 'filter-widget-date-range-to-clear'
            }
            aria-label={t('filterWidget.calendar.clearDate')}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
          >
            <Icon name="closeSmall" />
          </IconButton>
        )}
        <IconButton
          type="button"
          data-testid={
            isFrom
              ? 'filter-widget-date-range-from-calendar'
              : 'filter-widget-date-range-to-calendar'
          }
          aria-label={t('filterWidget.calendar.openCalendar')}
          aria-haspopup="dialog"
          aria-expanded={isOpenHere}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation();
            if (disabled) return;
            onOpenChange(!isOpenHere);
          }}
        >
          <Icon name="calendar" box={16} />
        </IconButton>
      </TrailingEnd>
    </Field>
  );
}

/**
 * @param props - Attribute, linked filter, clock, data bounds, and publish callback.
 * @returns The two-field Range trigger, with its shared calendar panel anchored beneath it.
 * @internal
 */
export function DateRangePickerFilter(props: DateRangePickerFilterProps) {
  const {
    attribute,
    filter = null,
    onFilterUpdate,
    id,
    today: todayProp,
    earliestData,
    latestData,
    label,
    error,
    disabled,
    state,
    size,
    radius,
    width,
    controlStyle,
    className,
  } = props;
  const { t } = useTranslation();
  const { mask, locale } = useDateMask();
  const today = todayProp ?? new Date();
  const fieldId = useFieldId(id);
  const toFieldId = `${fieldId}-to`;
  const hasLabel = label !== undefined && label !== null;
  const labelId = `${fieldId}-label`;

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const setFromInputRef = (element: HTMLInputElement | null) => {
    fromInputRef.current = element;
  };
  const setToInputRef = (element: HTMLInputElement | null) => {
    toInputRef.current = element;
  };

  /* ONE calendar for the pair: `isOpen` plus which end it edits. Both fields trigger the
     same popover, anchored in one fixed place (under From), so pointing it at the other
     end never moves it — and never toggles `isOpen` off in between, so the panel's mount
     never flickers as focus hands off. */
  const [isOpen, setOpen] = useState(false);
  /** The panel's working copy while open; nothing reaches the owner until Apply/Enter. */
  const [draft, setDraft] = useState<RangeDraft>(emptyRangeDraft());
  /* Mirrors `draft` synchronously, so a same-tick read sees the fresh value rather than the
     previous render's — `setDraft` alone isn't visible until the next render. Needed because
     the typed hand-off (`changeEnd`) calls `.focus()` on the other end in the same tick as
     writing the draft; that focus move blurs the field it just left, and `commitEnd`'s
     validation there must judge the JUST-typed text, not what `draft` held a render ago
     (CodeRabbit review finding). Matches the prototype's own `draftRef`. */
  const draftRef = useRef<RangeDraft>(draft);
  const writeDraft = (next: RangeDraft) => {
    draftRef.current = next;
    setDraft(next);
  };
  /** A pair refused on Apply/Enter — stays in view under the closed fields until reopened. */
  const [rejected, setRejected] = useState<RangeDraft | null>(null);
  /** Which end a calendar pick lands on next; also which end Enter/Apply reports on close. */
  const [activeEnd, setActiveEnd] = useState<RangeEnd>('from');
  const [fromProblem, setFromProblem] = useState<RangeEntryProblem | null>(null);
  const [toProblem, setToProblem] = useState<RangeEntryProblem | null>(null);

  const liftInverted = useCallback(
    (prev: RangeEntryProblem | null) => (prev === 'inverted' ? null : prev),
    [],
  );

  /** What the linked filter reads as, in the reader's own format — the closed-field value. */
  const committedDraft = useMemo(() => filterToRangeDraft(filter, mask), [filter, mask]);
  /** Open, the fields show the live draft; closed, a refused pair or else the committed one. */
  const displayed = isOpen ? draft : rejected ?? committedDraft;

  const dismissible = isOpen && !state;
  const dismiss = useCallback(() => {
    setFromProblem(null);
    setToProblem(null);
    setOpen(false);
  }, []);
  /* Dismissal is watched at the ROW, not per field, so clicking from one end's trigger to
     the other's never counts as "outside" — only a real click-out (or Escape) reverts.
     `anchorRef` is the row itself; `overlayRef` is the portaled panel's own wrapper (the
     panel is not a DOM descendant of the row, so containment against the row alone would
     call every click inside the panel an outside click). */
  const { anchorRef, overlayRef } = useDismiss<HTMLDivElement>(dismissible, dismiss);
  const activeInputRef = activeEnd === 'from' ? fromInputRef : toInputRef;
  /* A keyboard close (Escape, Enter on Apply) hands focus back to whichever field is active;
     a pointer close (a button click, an outside click) leaves focus where the pointer put it —
     the hook itself tells the two apart. */
  const restoreFocus = useRestoreFocusOnClose(dismissible, activeInputRef);

  const setProblemAt = (end: RangeEnd, problem: RangeEntryProblem | null) =>
    (end === 'from' ? setFromProblem : setToProblem)(problem);

  /**
   * Click or glyph open: both fields are always mounted, so — unlike a panel whose
   * body only exists while open — there is no render-phase gap to bridge, and the seed can
   * be computed synchronously, right here, from whatever is currently displayed. Only ever
   * sets `isOpen` to `true` — a hand-off from one end to the other, while already open,
   * changes `activeEnd` alone, so the panel's mount never toggles.
   * @param end - Which field was clicked/focused.
   */
  const openField = (end: RangeEnd) => {
    if (isOpen) {
      setActiveEnd(end);
      (end === 'from' ? fromInputRef : toInputRef).current?.focus();
      return;
    }
    const seed = rejected ?? committedDraft;
    writeDraft(seed);
    setFromProblem(rejected ? judgeRangeEnd(mask, seed, 'from', seed.from) : null);
    setToProblem(rejected ? judgeRangeEnd(mask, seed, 'to', seed.to) : null);
    setActiveEnd(end);
    setRejected(null);
    setOpen(true);
    (end === 'from' ? fromInputRef : toInputRef).current?.focus();
  };

  /**
   * A keystroke in a closed field opens the panel the same way a click does — seeded from
   * what is currently displayed, not from whatever `draft` happens to hold left over from an
   * earlier, abandoned session, which is why `base` is read from `displayed`'s own source
   * rather than the possibly-stale `draft` state whenever the field was not already open.
   * @param end - Which field just changed.
   * @param text - The field's new, already-masked text.
   */
  const changeEnd = (end: RangeEnd, text: string) => {
    if (rejected) setRejected(null);
    const base = isOpen ? draft : rejected ?? committedDraft;
    if (!isOpen) setOpen(true);
    const next = withRangeEnd(base, end, text);
    writeDraft(next);
    setProblemAt(end, null);
    setFromProblem(liftInverted);
    setToProblem(liftInverted);

    /* A full, valid From hands off to To — the same "one end done, the other becomes
       active" rule a pick follows (`handlePick`), extended to typing. Not the reverse: typing
       a full To does not hand back to From — the prototype's own asymmetry (its hand-off is
       pick-only both ways; the typed one is spec'd From -> To alone). Only while To is still
       empty: completing an already-set From must not steal the caret from an edit in
       progress on To. */
    const handOff =
      end === 'from' &&
      text.length === mask.length &&
      next.to === '' &&
      !judgeRangeEnd(mask, next, 'from', text);
    setActiveEnd(handOff ? 'to' : end);
    if (handOff) toInputRef.current?.focus();
  };

  /* Reformats and judges a typed end when it loses focus, same as a full commit — but only
     while the panel is open: a Tab-in/Tab-out that never typed anything must not resurrect a
     stale `draft` left over from a previous, abandoned edit onto the closed, committed
     fields. */
  const commitEnd = (end: RangeEnd) => {
    if (!isOpen) return;
    const text = end === 'from' ? draftRef.current.from : draftRef.current.to;
    const problem = judgeRangeEnd(mask, draftRef.current, end, text);
    setProblemAt(end, problem);
    if (!problem) {
      setFromProblem(liftInverted);
      setToProblem(liftInverted);
    }
    if (text.trim() === '') return;
    const parsed = parseDateInput(mask, text);
    if (parsed) writeDraft(withRangeEnd(draftRef.current, end, formatDateInput(mask, parsed)));
  };

  /**
   * Clears one field's own value.
   *
   * Open, this edits the live draft in place — same as any other edit, nothing publishes
   * until Apply/Enter. Closed, it does **not** publish directly — only Apply/Enter
   * commits — it opens the panel instead, seeded from the current value with this end
   * already blanked, the same "open, don't publish" rule a keystroke into a closed field
   * already follows (`changeEnd`). The reader still has to Apply to actually clear the
   * committed filter.
   * @param end - Which field's ✕ was clicked.
   */
  const clearEnd = (end: RangeEnd) => {
    if (isOpen) {
      setRejected(null);
      writeDraft(withRangeEnd(draftRef.current, end, ''));
      setProblemAt(end, null);
      setFromProblem(liftInverted);
      setToProblem(liftInverted);
      (end === 'from' ? fromInputRef : toInputRef).current?.focus();
      return;
    }
    const base = rejected ?? committedDraft;
    const seed = withRangeEnd(base, end, '');
    writeDraft(seed);
    setFromProblem(rejected ? judgeRangeEnd(mask, seed, 'from', seed.from) : null);
    setToProblem(rejected ? judgeRangeEnd(mask, seed, 'to', seed.to) : null);
    setActiveEnd(end);
    setRejected(null);
    setOpen(true);
    (end === 'from' ? fromInputRef : toInputRef).current?.focus();
  };

  const clearDraft = () => {
    writeDraft(emptyRangeDraft());
    setRejected(null);
    setFromProblem(null);
    setToProblem(null);
  };

  /**
   * Apply/Enter: usable publishes and closes; unusable closes without
   * publishing, keeping the refused pair in view under the closed fields.
   */
  const finish = () => {
    if (isRangeDraftUsable(mask, draftRef.current)) {
      const config = filter?.config ? { ...filter.config } : undefined;
      onFilterUpdate?.(rangeDraftToFilter(attribute, draftRef.current, mask, config, t));
      setRejected(null);
      setFromProblem(null);
      setToProblem(null);
      setOpen(false);
      return;
    }
    // Freshly judged against the FINAL draft — not whatever each field's own last
    // onChange/commit happened to leave in state — so the closed fields' messages always
    // match what is actually being rejected.
    const nextFromProblem = judgeRangeEnd(mask, draftRef.current, 'from', draftRef.current.from);
    const nextToProblem = judgeRangeEnd(mask, draftRef.current, 'to', draftRef.current.to);
    // The inverted flag attaches only to the field just edited (`activeEnd`), never
    // both at once for the same fault — judging each end against the same final draft
    // independently means BOTH come back 'inverted' when the pair actually is; a genuine
    // per-end fault (malformed/nonexistent) is left alone regardless, since that is its own
    // field's problem, not a cross-end one.
    setFromProblem(nextFromProblem === 'inverted' && activeEnd !== 'from' ? null : nextFromProblem);
    setToProblem(nextToProblem === 'inverted' && activeEnd !== 'to' ? null : nextToProblem);
    setRejected(draftRef.current);
    setOpen(false);
  };

  /**
   * Enter and the calendar glyph SETTLE the pair: finish, AND drop the caret — never
   * handed back — whether or not the entry is usable.
   */
  const settle = () => {
    restoreFocus.suppressOnce();
    finish();
    activeInputRef.current?.blur();
  };

  const onEnterFor = (end: RangeEnd) => {
    if (isOpen) {
      settle();
      return;
    }
    (end === 'from' ? fromInputRef : toInputRef).current?.blur();
  };

  const gridValue = useMemo(
    () => ({ from: parseDateInput(mask, draft.from), to: parseDateInput(mask, draft.to) }),
    [mask, draft],
  );

  const handlePick = ({ value, nextActiveEnd }: DateRangePickResult) => {
    if (rejected) setRejected(null);
    writeDraft({
      from: value.from ? formatDateInput(mask, value.from) : '',
      to: value.to ? formatDateInput(mask, value.to) : '',
    });
    setActiveEnd(nextActiveEnd);
    setFromProblem(null);
    setToProblem(null);
  };

  /* Border only while the panel is open and still being edited — the
     message text is a CLOSED-fields concern, below. */
  const fromMessage = fromProblem
    ? fromProblem === 'inverted'
      ? t(rangeInversionMessageKey('from'))
      : endMessage(t, mask, fromProblem)
    : undefined;
  const toMessage = toProblem
    ? toProblem === 'inverted'
      ? t(rangeInversionMessageKey('to'))
      : endMessage(t, mask, toProblem)
    : undefined;
  /* A forced `error` (with no live per-end problem) marks both boxes invalid and shows its
     message once, under To — From takes the border only, so the message is never doubled.
     Typed/committed problems still win per end. */
  const fromFieldError: FieldOwnProps['error'] = fromProblem
    ? isOpen
      ? true
      : fromMessage
    : error
    ? true
    : undefined;
  const toFieldError: FieldOwnProps['error'] = toProblem ? (isOpen ? true : toMessage) : error;

  /**
   * Whether focus has moved to something the control still owns, panel included.
   * @param next - The focus target being moved to.
   * @returns Whether `next` sits inside the row or the shared calendar panel.
   */
  const ownsFocus = (next: EventTarget | null) =>
    next instanceof Node &&
    (Boolean(anchorRef.current?.contains(next)) || Boolean(overlayRef.current?.contains(next)));

  const panelRadius: FieldRadius = radius ?? 's';

  /* Keyboard (the date picker's contract, `calendarKeys.ts`): the calendar hangs off the
     ROW, not either field, so the row handles what a field's own popover would — `↓` from
     either entry steps onto the grid's home cell; focus LEAVING the row (Tab past Apply)
     dismisses, as a click outside does — no focus trap; and a keyboard close (Escape, Enter
     on Apply) hands focus back to the end being edited instead of dropping it on the page. */
  const rowKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (dismissible) focusGridFromInput(overlayRef.current, event);
  };
  const rowBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    if (ownsFocus(event.relatedTarget)) return;
    /* Focus leaving the row entirely — Tab past the calendar's Apply — closes the panel, as
       an outside click does: no focus trap, and no draft applied. Only for a real next
       target: a null `relatedTarget` is the window losing focus, not the reader moving on. */
    if (dismissible && event.relatedTarget) dismiss();
  };

  const foot = (
    <Foot>
      <ClearButton
        type="button"
        data-testid="filter-widget-panel-clear"
        $radius={panelRadius}
        onClick={clearDraft}
      >
        {t('filterWidget.controls.clear')}
      </ClearButton>
      <Actions>
        <SecondaryButton
          type="button"
          data-testid="filter-widget-panel-cancel"
          $radius={panelRadius}
          onClick={dismiss}
        >
          {t('filterEditor.buttons.cancel')}
        </SecondaryButton>
        <PrimaryButton
          type="button"
          data-testid="filter-widget-panel-apply"
          $radius={panelRadius}
          onClick={finish}
        >
          {t('filterEditor.buttons.apply')}
        </PrimaryButton>
      </Actions>
    </Foot>
  );

  const popoverContent: ReactNode = isOpen ? (
    <Panel
      data-testid="filter-widget-date-range-panel"
      $radius={panelRadius}
      role="dialog"
      aria-label={t('filterWidget.calendar.chooseDates')}
      onKeyDown={(event) => panelArrowNav(event.currentTarget, event)}
    >
      {/* Keep the caret in the active field: a grid press is a sibling of the row above,
          not their popover, so mousedown would otherwise blur and lose the draft (same
          reasoning as date Condition's own inline calendar). */}
      <div onMouseDown={(event) => event.preventDefault()}>
        <DateRangeCalendarGrid
          value={gridValue}
          activeEnd={activeEnd}
          onPick={handlePick}
          earliestData={earliestData}
          latestData={latestData}
          today={today}
          locale={locale}
          mask={mask}
        />
      </div>
      {foot}
    </Panel>
  ) : null;

  return (
    <Root
      ref={anchorRef}
      $width={width}
      className={className}
      onKeyDown={rowKeyDown}
      onBlur={rowBlur}
    >
      {hasLabel && (
        <Label>
          <LabelText id={labelId}>{label}</LabelText>
        </Label>
      )}
      <Row
        role="group"
        aria-labelledby={hasLabel ? labelId : undefined}
        data-testid="filter-widget-date-range-row"
      >
        <Cell>
          {/* The panel is anchored here — always under the From field's own box, which
              never moves — via `popover`, so switching the active end never repositions
              it. `popoverRef` feeds the row-level dismiss its portaled panel's own element
              (see `overlayRef` above). */}
          <RangeEndField
            end="from"
            fieldId={fieldId}
            mask={mask}
            text={displayed.from}
            fieldError={fromFieldError}
            disabled={disabled}
            state={state}
            size={size}
            radius={radius}
            controlStyle={controlStyle}
            isOpenHere={isOpen && activeEnd === 'from'}
            inputRef={setFromInputRef}
            onChangeText={(next) => changeEnd('from', next)}
            onEnter={() => onEnterFor('from')}
            onFieldBlur={() => commitEnd('from')}
            onClear={() => clearEnd('from')}
            onOpenChange={(wantOpen) => (wantOpen ? openField('from') : settle())}
            popover={popoverContent}
            popoverRef={overlayRef}
          />
        </Cell>

        <Dash $size={size ?? 's'} aria-hidden="true">
          –
        </Dash>

        <Cell>
          <RangeEndField
            end="to"
            fieldId={toFieldId}
            mask={mask}
            text={displayed.to}
            fieldError={toFieldError}
            disabled={disabled}
            state={state}
            size={size}
            radius={radius}
            controlStyle={controlStyle}
            isOpenHere={isOpen && activeEnd === 'to'}
            inputRef={setToInputRef}
            onChangeText={(next) => changeEnd('to', next)}
            onEnter={() => onEnterFor('to')}
            onFieldBlur={() => commitEnd('to')}
            onClear={() => clearEnd('to')}
            onOpenChange={(wantOpen) => (wantOpen ? openField('to') : settle())}
          />
        </Cell>
      </Row>
    </Root>
  );
}
