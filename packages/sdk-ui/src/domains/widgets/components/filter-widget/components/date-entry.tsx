/**
 * The date picker's typed entry: one masked field in the reader's own date format, with a
 * calendar glyph that opens the grid beneath it.
 *
 * The date can be typed or picked. Typing goes into one masked input, regrouped as it
 * arrives, with the part still to type left on screen as a grey ghost — so the format
 * never disappears at the first keystroke, it fills in. The calendar glyph is its own
 * button; a click on the box's padding places the caret instead, so the two affordances do
 * not fight over one click.
 *
 * The entry validates when focus leaves the field, and Enter confirms it — Enter always
 * settles the field, but only a usable entry is submitted, so a refused one is left for
 * the host to show, flagged, under the closed field.
 * @internal
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import { focusGridFromInput, useRestoreFocusOnClose } from './calendar-a11y';
import { parseDateInput } from './date-text';
import type { DateMask } from './date-text';
import { controlWidth } from './design-tokens';
import { Field, IconButton, resolveFieldState, Trailing } from './field';
import type { FieldOwnProps } from './field';
import { Icon } from './icons';
import { MaskedDateInput } from './masked-date-input';
import { useDismiss } from './use-dismiss';
import { useFieldId } from './use-field-id';
import { useHover } from './use-hover';

/** @internal */
export type DateEntryProps = FieldOwnProps & {
  /** The reader's date format, threaded to the masked entry. */
  mask: DateMask;
  /** Text in the field, however far it has been typed. */
  value?: string;
  /** Every keystroke, already regrouped to the mask. */
  onChange?: (text: string) => void;
  /**
   * Fires when focus leaves the field, and on Enter — the parsed date, or null when the
   * text is not a real calendar date. The text comes alongside so a refused entry can be
   * kept on screen and flagged rather than silently discarded.
   */
  onCommit?: (date: Date | null, text: string) => void;
  /**
   * Fires when the entry is confirmed with Enter — the keyboard twin of the panel's Apply.
   * Distinct from `onCommit`, which also fires on focus-out to validate only: a host that
   * commits a draft solely on Apply publishes here, and not on blur, so tabbing or
   * clicking away never applies a half-made edit.
   */
  onSubmit?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  clearable?: boolean;
  onClear?: () => void;
  id?: string;
  /** Overlay anchored under the box — the calendar grid. */
  popover?: ReactNode;
  /** Reaches the masked entry itself, so a paired control can move focus into it. */
  inputRef?: Ref<HTMLInputElement>;
  dataTestId?: string;
};

/* Nothing in the box stretches, so the trailing glyphs pin themselves to its end — in a
   stretching field the input pushed them there. */
const TrailingEnd = styled(Trailing)`
  margin-inline-start: auto;
`;

/**
 * Renders the typed date entry.
 * @param props - The masked text, the open state and the calendar to anchor
 * @returns The entry, with its calendar anchored beneath it
 * @internal
 */
export function DateEntry({
  mask,
  value = '',
  onChange,
  onCommit,
  onSubmit,
  open,
  onOpenChange,
  clearable = true,
  onClear,
  id,
  popover,
  inputRef: inputRefProp,
  dataTestId,
  label,
  error,
  disabled,
  state,
  size,
  radius,
  width,
  controlStyle,
  className,
}: DateEntryProps) {
  const { t } = useTranslation();
  const fieldId = useFieldId(id);
  const { hovered, handlers } = useHover(disabled);
  const [focusWithin, setFocusWithin] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const setInputRef = (element: HTMLInputElement | null) => {
    inputRef.current = element;
    if (typeof inputRefProp === 'function') inputRefProp(element);
    else if (inputRefProp) inputRefProp.current = element;
  };

  const isOpen = (open ?? false) || state === 'active';
  /* One flag for one state: a caret in the field, or an open calendar, so the border and
     everything that follows from Active cannot disagree. */
  const active = focusWithin || isOpen;
  const resolvedState = resolveFieldState({ state, disabled, hovered, active });
  const hasValue = value.length > 0;
  const pointerOver = hovered || state === 'hover';
  const showClear = clearable && hasValue && (pointerOver || active) && !disabled;

  const dismissible = isOpen && Boolean(popover) && !state;
  const dismiss = useCallback(() => onOpenChange?.(false), [onOpenChange]);
  const { anchorRef, overlayRef } = useDismiss<HTMLDivElement>(dismissible, dismiss);
  /* A keyboard close (Escape, Enter on Apply) hands focus back to the entry rather than
     dropping it on the page; a pointer close leaves focus where the pointer put it. */
  const restoreFocus = useRestoreFocusOnClose(dismissible, inputRef);

  const commit = () => onCommit?.(parseDateInput(mask, value), value);

  /* Enter always settles the field — closes the calendar and drops the caret — whether or
     not the entry is usable. Only a usable entry is submitted; a refused one is left to
     the host to show, flagged, under the closed field. "Usable" is a real parseable date,
     or an empty field, which means "no filter". */
  const commitAndClose = () => {
    commit();
    const usable = value.trim() === '' || parseDateInput(mask, value) !== null;
    /* `isOpen`, not the raw prop: a host may open the panel through `state="active"` with
       no `open` of its own, and Enter has to settle that field the same way. */
    if (isOpen) {
      if (usable) onSubmit?.();
      // This close drops the caret on purpose — do not hand focus back to the entry.
      restoreFocus.suppressOnce();
      onOpenChange?.(false);
    }
    inputRef.current?.blur();
  };

  /* Type-ahead: whenever the calendar opens, drop the caret into the entry so the reader
     can type the date straight away. Covers every way it opens — a click on the box, the
     calendar glyph, or a parent opening the popover — since the glyph and a programmatic
     open do not focus on their own. Keyed on `open`, not the painted state, so a pinned
     variant never steals focus. */
  useEffect(() => {
    if (open && !disabled) inputRef.current?.focus({ preventScroll: true });
  }, [open, disabled]);

  /** Whether focus has moved to something the control still owns, panel included. */
  const ownsFocus = (next: EventTarget | null) =>
    next instanceof Node &&
    (Boolean(anchorRef.current?.contains(next)) || Boolean(overlayRef.current?.contains(next)));

  const describedBy = error ? `${fieldId}-error` : undefined;

  return (
    <Field
      label={label}
      error={error}
      resolvedState={resolvedState}
      size={size}
      radius={radius}
      width={width ?? controlWidth.date}
      controlStyle={controlStyle}
      className={className}
      labelFor={fieldId}
      errorId={`${fieldId}-error`}
      popover={popover}
      rootRef={anchorRef}
      popoverRef={overlayRef}
      clickable
      boxProps={{
        ...handlers,
        'data-testid': 'filter-widget-date-input-trigger',
        /* Keep focus where it is when the box's own padding is pressed, so the click
           below can decide what to do with it. */
        onMouseDown: (event) => {
          if (!(event.target as HTMLElement).closest('input,button')) event.preventDefault();
        },
        /* A click anywhere on the field opens the calendar and takes the caret, so one
           click leaves it ready to type with the format hint showing. Open-only, not a
           toggle: a second click on an open field keeps it open, and dismissal closes it. */
        onClick: (event) => {
          if ((event.target as HTMLElement).closest('button')) return;
          inputRef.current?.focus();
          onOpenChange?.(true);
        },
      }}
      /* Focus is watched at the root, not the box: the field is larger than its box, and
         the calendar hangs off it. Watching the box meant paging months in the calendar
         blurred it and committed a half-typed date. */
      rootProps={{
        onFocus: () => setFocusWithin(true),
        onBlur: (event) => {
          if (ownsFocus(event.relatedTarget)) return;
          setFocusWithin(false);
          commit();
          /* Focus leaving the field — Tab past the calendar's Apply — closes the panel, as
             a click outside does: no focus trap, and no draft applied. Only for a real next
             target: a null `relatedTarget` is the window losing focus, not the reader
             moving on. */
          if (dismissible && event.relatedTarget) onOpenChange?.(false);
        },
        /* The down arrow in the entry steps onto the open calendar's home cell. The panel
           is portaled, so the grid is looked for there rather than under the root. */
        onKeyDown: (event) => {
          if (dismissible) focusGridFromInput(overlayRef.current, event);
        },
      }}
    >
      <MaskedDateInput
        ref={setInputRef}
        id={fieldId}
        mask={mask}
        value={value}
        onChange={(text) => onChange?.(text)}
        onEnter={commitAndClose}
        labelledBy={label === undefined || label === null ? undefined : `${fieldId}-label`}
        describedBy={describedBy}
        invalid={Boolean(error)}
        disabled={disabled}
        dataTestId={dataTestId ?? 'filter-widget-date-input'}
      />

      <TrailingEnd>
        {/* Mounted whenever there is a value and shown on hover or focus: toggling
            visibility rather than existence keeps the slot's width, so the calendar glyph
            never jumps when the clear affordance appears. */}
        {clearable && hasValue && !disabled && (
          <IconButton
            type="button"
            style={showClear ? undefined : { visibility: 'hidden' }}
            /* A pointer affordance: the keyboard clears with Backspace, and Tab should
               step from one entry to the next, not through the glyphs. */
            tabIndex={-1}
            data-testid="filter-widget-date-input-clear"
            aria-label={t('filterWidget.calendar.clearDate')}
            // Keep focus in the field: blurring would commit the text being cleared.
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              onChange?.('');
              onClear?.();
              /* Clearing an open calendar keeps the caret, since the entry is being
                 edited; clearing a closed one leaves the field settled, not Active. */
              if (isOpen) inputRef.current?.focus();
              else inputRef.current?.blur();
            }}
          >
            <Icon name="closeSmall" />
          </IconButton>
        )}

        <IconButton
          type="button"
          data-testid="filter-widget-date-input-calendar"
          aria-label={t('filterWidget.calendar.openCalendar')}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation();
            if (!disabled) onOpenChange?.(!isOpen);
          }}
        >
          <Icon name="calendar" box={16} />
        </IconButton>
      </TrailingEnd>
    </Field>
  );
}
