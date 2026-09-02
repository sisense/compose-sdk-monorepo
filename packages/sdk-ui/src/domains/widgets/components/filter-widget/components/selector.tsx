import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { spacing } from './design-tokens';
import {
  Chip,
  Field,
  FieldInput,
  IconButton,
  resolveFieldState,
  SecondaryGlyph,
  Trailing,
} from './field';
import type { FieldOwnProps } from './field';
import { createTextMeasurer, fitNames } from './fit-names';
import { Icon } from './icons';
import { useDismiss } from './use-dismiss';
import { useFieldId } from './use-field-id';
import { useHover } from './use-hover';

// What the ✕ takes out of the box when it appears — one icon slot, flush against the chevron.
const CLEAR_SLOT_WIDTH = parseInt(spacing.iconM, 10);

/** @internal */
export type SelectorProps = FieldOwnProps & {
  value?: string;
  placeholder?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  id?: string;
  listboxId?: string;
  activeOptionId?: string;
  popover?: ReactNode;
  /** Sits beside the value in its own slot — the `+N` overflow count. */
  badge?: ReactNode;
  title?: string;
  /**
   * The chosen values, when the trigger is reading a selection back.
   *
   * Given instead of a pre-joined `value` so the fitting happens here, where the box's width is
   * known: the same control is 188px standalone and full-width inside the widget, and only the
   * element can say how much room it has. `value` still wins for a label that is not a list —
   * a placeholder, `Include all`, or an exclude-mode count.
   */
  names?: readonly string[];
  /**
   * Hover popover under the closed box — the full filter when the trigger has
   * abbreviated it (truncated sentence, or names behind `+N`). Prefer this
   * over `title`: it can hold a line per condition.
   *
   * Shown only when the box is actually holding something back, and hidden
   * while open, because the panel is already there and saying more.
   */
  tooltip?: ReactNode;
  /**
   * Overrides the trigger's test id. Needed where one screen holds more than one selector
   * — the date panel's level and value fields — so a test can tell them apart.
   */
  dataTestId?: string;
};

/**
 * The filter widget's select trigger.
 *
 * One text field backs every state — read-only when closed, where it reads as a
 * button, and editable when open, so the same caret keeps focus through the
 * transition. Swapping a `button` for an `input` on open would drop focus instead.
 * @param props - Value, open state, the search query and the panel to anchor
 * @returns The trigger, with its panel anchored beneath it
 * @internal
 */
export function Selector({
  value,
  placeholder,
  open,
  onOpenChange,
  search = '',
  onSearchChange,
  searchPlaceholder,
  searchable = true,
  clearable = true,
  onClear,
  id,
  listboxId,
  activeOptionId,
  popover,
  badge,
  title,
  names,
  tooltip,
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
}: SelectorProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useFieldId(id);
  const { hovered, handlers } = useHover(disabled);
  const [focused, setFocused] = useState(false);
  const [valueWidth, setValueWidth] = useState(0);
  const clearSlotRef = useRef(0);

  /* Track the input's own width, so a control that is 188px on one page and full-width in a
     widget fits a different number of values without either of them being told a budget. The
     ✕'s slot is added back, so the tracked width is the one the value has when the pointer is
     away — see `clearSlotRef`. */
  useEffect(() => {
    const input = inputRef.current;
    if (!input || typeof ResizeObserver === 'undefined') {
      return;
    }
    const measureWidth = () => setValueWidth(input.clientWidth + clearSlotRef.current);
    const observer = new ResizeObserver(measureWidth);
    observer.observe(input);
    measureWidth();
    return () => observer.disconnect();
  }, []);

  const isOpen = (open ?? false) || state === 'active';
  const querying = isOpen && searchable;
  const resolvedState = resolveFieldState({ state, disabled, hovered, active: isOpen });
  const hasValue = Boolean(names?.length || value);
  const pointerOver = hovered || state === 'hover';
  /* Focus counts as well as hover: a keyboard user who can reach the trigger but never the
     ✕ has no way to clear the filter at all. */
  const showClear =
    clearable && hasValue && !disabled && (pointerOver || focused || state === 'active');

  /* How much of the box the ✕ is taking right now. Assigned during render rather than from an
     effect because the observer can be told about the narrower input before an effect would
     have run, and the measurement has to discount the ✕ in the same pass that mounts it.

     Discounted at all, because how many values are named must not depend on where the pointer
     is: the ✕ appears on hover and would otherwise take its slot out of the value, drop a name
     and bump the count — one selection reading `+2` and then `+3`. Measuring the box as though
     the ✕ were away instead lets the last name run under it and take the input's ellipsis,
     which is what the design does. */
  clearSlotRef.current = showClear ? CLEAR_SLOT_WIDTH : 0;

  const fitted = useMemo(() => {
    const input = inputRef.current;
    if (!names?.length || !valueWidth || !input) {
      return null;
    }
    const style = getComputedStyle(input);
    const measure = createTextMeasurer(
      style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
    );
    return measure ? fitNames(names, valueWidth, measure) : null;
  }, [names, valueWidth]);

  /* Before measurement — the first paint, or jsdom — name them all rather than none: too much
     text is clipped by the box, where too little would silently hide a selection. */
  const shownValue = names?.length ? fitted?.text ?? names.join(', ') : value;
  const hiddenCount = fitted?.hidden ?? 0;
  const valueOverflows = useMemo(() => {
    const input = inputRef.current;
    if (names?.length || !value || !valueWidth || !input) {
      return false;
    }
    const style = getComputedStyle(input);
    const measure = createTextMeasurer(
      style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
    );
    return measure ? measure(value) > valueWidth : false;
  }, [names, value, valueWidth]);

  /* The hover undoes every abbreviation — names the box counted, or a sentence it
     truncated. It stays away when the box already said everything, including a
     caller tooltip for a chain that still fits. The box's own `title` would say
     the same thing a second later, so it steps aside while this shows. */
  const isTruncated = hiddenCount > 0 || valueOverflows;
  const shownTooltip = (() => {
    if (!pointerOver || isOpen || !isTruncated) {
      return undefined;
    }
    if (tooltip) {
      return tooltip;
    }
    if (hiddenCount > 0 && names?.length) {
      return names.join(', ');
    }
    return value;
  })();

  const dismiss = useCallback(() => onOpenChange?.(false), [onOpenChange]);
  const { anchorRef, overlayRef } = useDismiss<HTMLDivElement>(
    isOpen && Boolean(popover) && !state,
    dismiss,
  );

  /* Without the reset, a value wider than the box stays scrolled where the caret left
     it and shows its middle instead of its start plus an ellipsis. */
  useEffect(() => {
    if (!querying && inputRef.current) {
      inputRef.current.scrollLeft = 0;
    }
  }, [querying, isOpen, value]);

  const toggle = () => {
    if (disabled) {
      return;
    }
    onOpenChange?.(!isOpen);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    if (!isOpen && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
      event.preventDefault();
      onOpenChange?.(true);
    }
  };

  return (
    <Field
      label={label}
      error={error}
      resolvedState={resolvedState}
      size={size}
      radius={radius}
      width={width}
      controlStyle={controlStyle}
      className={className}
      labelFor={fieldId}
      tooltip={shownTooltip}
      popover={popover}
      rootRef={anchorRef}
      popoverRef={overlayRef}
      clickable
      boxProps={{
        ...handlers,
        title: shownTooltip ? undefined : title,
        /* Focus is tracked for the whole box, not the input alone. Tracking the input meant
           tabbing from it to the ✕ blurred the input, dropped `focused`, and unmounted the
           button mid-transfer — so the very keyboard path this exists for lost its target. */
        onFocus: () => setFocused(true),
        onBlur: (event) => {
          /* `relatedTarget` is an `EventTarget`, and only a `Node` can be contained. The
             `instanceof` check narrows without a cast and covers the null case — focus going
             nowhere is focus leaving the control. */
          const nextFocus = event.relatedTarget;
          if (!(nextFocus instanceof Node) || !event.currentTarget.contains(nextFocus)) {
            setFocused(false);
          }
        },
        onMouseDown: (event) => {
          if (event.target === event.currentTarget) {
            event.preventDefault();
          }
        },
        onClick: (event) => {
          if (event.defaultPrevented) {
            return;
          }
          toggle();
        },
      }}
    >
      {querying && (
        <SecondaryGlyph>
          <Icon name="search" />
        </SecondaryGlyph>
      )}

      <FieldInput
        ref={inputRef}
        id={fieldId}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={isOpen ? activeOptionId : undefined}
        aria-autocomplete={querying ? 'list' : undefined}
        autoComplete="off"
        disabled={disabled}
        readOnly={!querying}
        data-testid={dataTestId ?? 'filter-widget-select-trigger'}
        value={querying ? search : shownValue ?? ''}
        placeholder={
          querying
            ? searchPlaceholder ?? t('filterWidget.controls.findInList')
            : placeholder ?? t('filterWidget.placeholders.setFilter')
        }
        onChange={(event) => onSearchChange?.(event.target.value)}
        onKeyDown={onKeyDown}
      />

      {hiddenCount > 0 ? <Chip>{`+${hiddenCount}`}</Chip> : badge}

      <Trailing>
        {showClear && (
          <IconButton
            type="button"
            data-testid="filter-widget-select-clear"
            aria-label={t('filterWidget.controls.clearSelection')}
            onClick={(event) => {
              event.stopPropagation();
              onClear?.();
            }}
          >
            <Icon name="closeSmall" />
          </IconButton>
        )}
        {/* A span, not a button: the whole box already toggles the control, so the
            chevron takes the round hover without becoming a second hit target. */}
        <IconButton as="span" aria-hidden="true">
          <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} />
        </IconButton>
      </Trailing>
    </Field>
  );
}
