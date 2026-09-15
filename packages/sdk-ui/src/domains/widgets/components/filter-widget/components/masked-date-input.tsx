/**
 * One date as a single masked input, with the rest of the reader's own date format shown
 * inline as a grey ghost that fills in as they type.
 *
 * The entry is a fixed size — pinned by a hidden sizer to the width of the whole format —
 * so it never resizes as it fills, and nothing beside it shifts. The visible glyphs are
 * drawn by the ghost; the input above it is transparent and carries only the caret, which
 * is what keeps the caret lined up cell-for-cell with the template.
 *
 * Every cell position comes off the {@link DateMask}, so a `de-DE` reader walks
 * `DD.MM.YYYY` and a `ja` one `YYYY/MM/DD` with the same machinery.
 * @internal
 */
import { forwardRef, useLayoutEffect, useRef } from 'react';

import styled from '@emotion/styled';

import {
  backspaceAt,
  dateTemplateCells,
  dateTemplateString,
  deleteAt,
  firstEmptyCaret,
  nextSegmentCaret,
  parseDateInput,
  typeDigitAt,
} from './date-text';
import type { DateMask } from './date-text';
import { typography } from './design-tokens';
import { fwFallback, fwVar } from './field-palette';

/** @internal */
export type MaskedDateInputProps = {
  /** The reader's date format — segment order, separator and widths. */
  mask: DateMask;
  /** The masked text, however far it has been filled in. */
  value: string;
  /** Every keystroke, already regrouped to the mask. */
  onChange?: (text: string) => void;
  /** Enter — the field commits on it, above this input. */
  onEnter?: () => void;
  /** Names the entry for assistive technology when the field carries no visible label. */
  ariaLabel?: string;
  /** The field's shared label, by id. */
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
  /** Goes on the input, so the field's `label htmlFor` reaches it. */
  id?: string;
  dataTestId?: string;
};

const Holder = styled.span`
  position: relative;
  display: inline-grid;
  flex: 0 0 auto;
  align-items: center;
  justify-items: start;
  min-width: 0;
`;

/* Pins the box to the format's width — the letters, the widest it ever needs. */
const Sizer = styled.span`
  grid-area: 1 / 1;
  /* Room for the caret past the last digit, which an exact width would clip. */
  padding-right: 1px;
  font-size: ${typography.label.size};
  font-weight: ${typography.label.weight};
  line-height: ${typography.label.lineHeight};
  visibility: hidden;
  white-space: pre;
`;

const Ghost = styled.span`
  grid-area: 1 / 1;
  display: inline-flex;
  font-size: ${typography.label.size};
  font-weight: ${typography.label.weight};
  font-variant-numeric: tabular-nums;
  line-height: ${typography.label.lineHeight};
  white-space: pre;
  pointer-events: none;
`;

/* A typed digit — the field's own ink, since the input above is transparent. */
const CellInk = styled.span`
  color: ${fwVar('textPrimary', fwFallback.textPrimary)};
`;

/* An unfilled format letter, or a separator before an unfilled part — the grey guide a
   cleared part falls back to instead of a bogus `00`. */
const GhostHint = styled.span`
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
`;

const Input = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  font-family: inherit;
  font-size: ${typography.label.size};
  font-weight: ${typography.label.weight};
  /* Digits keep one advance width, so a value never reflows as its digits change. */
  font-variant-numeric: tabular-nums;
  line-height: ${typography.label.lineHeight};
  /* The glyphs live in the ghost; this carries only the caret over them. */
  color: transparent;
  caret-color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  background: transparent;
  border: 0;
  outline: none;

  /* The SDK's accessibility stylesheet rings every focused input
     (\`.csdk-accessible input:focus-visible\`), and a text input matches
     \`:focus-visible\` even when the focus came from a click — so the entry drew a ring
     round itself on every open, which the design does not have. Doubled to outrank that
     rule; the field's own border carries the focused state, as it does for every other
     control here. */
  &&:focus,
  &&:focus-visible {
    outline: none;
  }

  &:disabled {
    color: transparent;
    caret-color: transparent;
    cursor: not-allowed;
  }
`;

/* Any of these closes the current part and jumps to the next, whichever the mask itself
   uses — a reader reaching for `/` on a `.` locale still means "next part". */
const SEPARATOR_KEYS = ['/', '.', '-', ' '];

/**
 * Renders the masked date entry.
 * @param props - The masked text and the callbacks for editing and confirming it
 * @returns The ghost template with a transparent input over it
 * @internal
 */
export const MaskedDateInput = forwardRef<HTMLInputElement, MaskedDateInputProps>(
  function MaskedDateInput(
    {
      mask,
      value,
      onChange,
      onEnter,
      ariaLabel,
      labelledBy,
      describedBy,
      invalid,
      disabled,
      id,
      dataTestId,
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLInputElement>(null);
    const caretRef = useRef<number | null>(null);
    /* True from focusing a complete date until the first interaction — a tab-in is armed
       to be replaced by the first digit typed, and a click cancels it so the date can be
       edited in place. A half-typed date is never armed: tabbing back means "carry on". */
    const freshRef = useRef(false);

    const setRef = (element: HTMLInputElement | null) => {
      innerRef.current = element;
      if (typeof forwardedRef === 'function') forwardedRef(element);
      else if (forwardedRef) forwardedRef.current = element;
    };

    /* Deliberately no dependency array. React re-asserts the controlled template on every
       render, which resets the caret to the end of the input — so the caret has to be put
       back after every render, not only when `value` or `mask` changes. A dependency list
       here would drop the caret whenever a parent re-rendered for its own reasons. */
    useLayoutEffect(() => {
      const element = innerRef.current;
      if (element && document.activeElement === element) {
        if (caretRef.current !== null) {
          /* An emptied field always starts over from the first cell: clearing focuses the
             entry while the old value is still rendered, so the focus handler has already
             remembered the old end.

             Otherwise the requested caret is honoured as asked, clamped only to the
             template. It must NOT be pulled back to the first unfilled cell: a typed
             separator deliberately parks the caret in the NEXT part while the one behind it
             is still short — that is how `9/5/2026` gets typed — and clamping undid the
             jump on the very next render, so the digits packed back into the month. */
          const caret = value === '' ? 0 : Math.min(caretRef.current, mask.length);
          element.setSelectionRange(caret, caret);
        } else if (value === '') {
          element.setSelectionRange(0, 0);
        }
      }
      caretRef.current = null;
    });

    /* A value edit — publish the new clean text and remember where the caret should sit
       once React has re-asserted the template; the layout effect places it there. */
    const commit = (next: { masked: string; caret: number }) => {
      caretRef.current = next.caret;
      onChange?.(next.masked);
    };

    const cells = dateTemplateCells(mask, value);

    return (
      <Holder>
        <Sizer aria-hidden="true">{mask.template}</Sizer>
        <Ghost aria-hidden="true">
          {cells.map((cell, index) =>
            cell.filled ? (
              <CellInk key={index}>{cell.text}</CellInk>
            ) : (
              <GhostHint key={index}>{cell.text}</GhostHint>
            ),
          )}
        </Ghost>
        <Input
          ref={setRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          /* The full template, so the caret lines up cell-for-cell with the ghost above
             it — same string, same font. */
          value={dateTemplateString(mask, value)}
          data-testid={dataTestId}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          onFocus={(event) => {
            freshRef.current = parseDateInput(mask, value) !== null;
            const caret = firstEmptyCaret(mask, value);
            caretRef.current = caret;
            event.currentTarget.setSelectionRange(caret, caret);
          }}
          onBlur={() => {
            freshRef.current = false;
          }}
          onMouseUp={(event) => {
            freshRef.current = false;
            /* A click cannot land in the unfilled tail: an empty field puts the caret at
               the very start, a half-typed one at its first empty cell, so the next digit
               continues the entry rather than dropping into the middle of the format. A
               click within the digits already typed still lands where it was pressed. */
            const cap = firstEmptyCaret(mask, value);
            if ((event.currentTarget.selectionStart ?? 0) > cap) {
              event.currentTarget.setSelectionRange(cap, cap);
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const digits = event.clipboardData.getData('text').replace(/\D/g, '');
            if (!digits) return;
            let masked = value;
            let caret = event.currentTarget.selectionStart ?? firstEmptyCaret(mask, value);
            [...digits].forEach((digit) => {
              const next = typeDigitAt(mask, masked, caret, digit);
              masked = next.masked;
              caret = next.caret;
            });
            commit({ masked, caret });
          }}
          /* Keystrokes are handled in `onKeyDown`; the native input event is ignored and
             the controlled value re-asserts the template. Present only to keep React from
             warning about a controlled input without a change handler. */
          onChange={() => {}}
          onKeyDown={(event) => {
            const caret = event.currentTarget.selectionStart ?? 0;
            if (event.key === 'Enter') {
              event.preventDefault();
              onEnter?.();
              return;
            }
            if (/^[0-9]$/.test(event.key)) {
              event.preventDefault();
              // A tab-in on a complete date: the first digit clears it and starts over.
              const base = freshRef.current ? '' : value;
              const from = freshRef.current ? 0 : caret;
              freshRef.current = false;
              commit(typeDigitAt(mask, base, from, event.key));
              return;
            }
            freshRef.current = false;
            if (event.key === 'Backspace') {
              event.preventDefault();
              commit(backspaceAt(mask, value, caret));
            } else if (event.key === 'Delete') {
              event.preventDefault();
              commit(deleteAt(mask, value, caret));
            } else if (SEPARATOR_KEYS.includes(event.key)) {
              /* A separator closes the current part without padding it and jumps to the
                 next; the value is unchanged, so the caret can move immediately. */
              event.preventDefault();
              const to = nextSegmentCaret(mask, caret);
              innerRef.current?.setSelectionRange(to, to);
            }
            /* Arrows, Home, End, Tab and shortcuts fall through to the browser, so the
               caret walks one character at a time the way a reader expects. */
          }}
        />
      </Holder>
    );
  },
);
