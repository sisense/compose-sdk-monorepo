/**
 * The date picker filter control — a calendar that takes one date or several, assembled
 * from the date parts and the shared panel frame.
 *
 * The multi-select setting switches the two shapes:
 *
 * - **single** — a typeable masked entry opening a single-date calendar: type or pick one
 *   date.
 * - **multi** — a select trigger with the calendar glyph, reading the chosen days back as
 *   the earliest one named plus a `+N` count for the rest, opening a multi-select
 *   calendar. It names every chosen day in the hover tooltip rather than on the grid.
 *
 * Both open the calendar under the same Clear / Cancel / Apply footer the other panels
 * carry. Edits are a draft: picking or typing changes only what the panel shows, and Apply
 * — or Enter, its keyboard twin — is what commits it. Cancel, an outside click and Escape
 * all close without committing, so the field reverts to its committed value.
 *
 * The value is the chosen day(s) as masked text in the reader's own date format, so the
 * owner stores and summarises them the way it does every other filter. The format is
 * resolved here, once, and drives both the typed entry and the month grid — so the pattern
 * a reader types always matches the month names beside it.
 * @internal
 */
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { panelArrowNav } from './calendar-a11y';
import { CalendarGrid } from './calendar-grid';
import { DateEntry } from './date-entry';
import {
  dateProblemMessage,
  formatDateInput,
  parseDateInput,
  validateDateInput,
} from './date-text';
import type { DateEntryProblem } from './date-text';
import { controlWidth } from './design-tokens';
import type { FieldOwnProps, FieldRadius } from './field';
import {
  Actions,
  ClearButton,
  Foot,
  Panel,
  PrimaryButton,
  SecondaryButton,
} from './filter-widget-panel';
import { Selector } from './selector';
import { useDateMask } from './use-date-mask';

/** The chosen days as masked text — one entry in single mode, many in multi. @internal */
export type DatePickerValue = string[];

/** @internal */
export type DatePickerFilterProps = FieldOwnProps & {
  value?: DatePickerValue | null;
  onChange?: (value: DatePickerValue) => void;
  /** Single takes one date, multi toggles several; both stay open until Apply. */
  multiselect?: boolean;
  /** What the data covers — greys the days beyond it and aims the quick chips. */
  earliestData?: Date;
  latestData?: Date;
  /** Omit to let the control own its open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Injectable so a test renders the same on any day. */
  today?: Date;
  id?: string;
};

/**
 * Renders the date picker filter control.
 * @param props - The chosen dates, the selection mode and the data bounds
 * @returns The field and, while open, its calendar panel
 * @internal
 */
export function DatePickerFilter({
  value,
  onChange,
  multiselect = false,
  earliestData,
  latestData,
  open,
  onOpenChange,
  today,
  id,
  label,
  error,
  disabled,
  state,
  size,
  radius,
  width,
  controlStyle,
  className,
}: DatePickerFilterProps) {
  const { t } = useTranslation();
  const { mask, locale } = useDateMask();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  /** Single mode only — the typed text that does not parse. */
  const [problem, setProblem] = useState<DateEntryProblem | null>(null);
  /** The panel's working copy while open; nothing reaches the owner until Apply. */
  const [draft, setDraft] = useState<DatePickerValue>([]);
  /**
   * An entry refused at the last close stays in view under the closed field with its
   * message, instead of snapping back to the committed value — the reader can see what
   * was refused, and correct it in place when the field is reopened.
   */
  const [rejected, setRejected] = useState<string | null>(null);

  const dates = value ?? [];

  /* Re-seed the draft each time the panel opens: every edit inside the panel — a calendar
     pick, a keystroke, Clear — lands on this draft, never on the owner. Render-phase
     rather than an effect, so no stale frame is painted.

     When the panel opens because the reader started TYPING into a closed field, the first
     keystroke has already seeded the draft with that digit; re-seeding from `dates` here
     would wipe it. The ref, set in the field's `onChange`, tells that open apart from a
     plain click so only the latter re-seeds. */
  const openedByTyping = useRef(false);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      if (openedByTyping.current) {
        setProblem(null);
      } else {
        /* A refused entry is what the field shows, so a click-open keeps it to be
           corrected in place rather than swapping the committed date in under the
           reader's click. It keeps its flag — the red border — while the message waits. */
        setDraft(rejected !== null ? [rejected] : dates);
        setProblem(rejected !== null ? validateDateInput(mask, rejected).problem : null);
      }
      openedByTyping.current = false;
      setRejected(null);
    }
  }

  /* Closing remembers a refused entry so it stays on screen with its message. Opening
     leaves `rejected` alone for the re-seed above to pick up, which clears it there. */
  const setOpenKeepingRejected = (next: boolean) => {
    if (!next) {
      const raw = draft[0] ?? '';
      setRejected(raw && validateDateInput(mask, raw).problem ? raw : null);
    }
    setOpen(next);
  };

  /** Open, the field and calendar read the draft; closed, the committed value. */
  const active = isOpen ? draft : dates;
  /** The chosen day(s) as real dates, for the calendar. */
  const parsed = active
    .map((text) => parseDateInput(mask, text))
    .filter((date): date is Date => date !== null);

  const common = {
    id,
    label,
    disabled,
    state,
    size,
    radius,
    /* Pinned to the standard width so the field never resizes with its content — empty
       versus a picked date, the clear glyph mounting. An explicit `width` still wins. */
    width: width ?? controlWidth.default,
    controlStyle,
    className,
    open: isOpen,
    onOpenChange: setOpenKeepingRejected,
  };

  const panelRadius: FieldRadius = radius ?? 's';

  /**
   * Clear / Cancel / Apply — the same footer the other panels carry. Edits land on the
   * draft, so Apply is the one path that publishes it; Cancel just closes and the field
   * reverts; Clear empties the draft, which is still only real once Apply is pressed.
   */
  const foot = (
    <Foot>
      <ClearButton
        type="button"
        data-testid="filter-widget-panel-clear"
        $radius={panelRadius}
        onClick={() => {
          setDraft([]);
          setProblem(null);
        }}
      >
        {t('filterWidget.controls.clear')}
      </ClearButton>
      <Actions>
        <SecondaryButton
          type="button"
          data-testid="filter-widget-panel-cancel"
          $radius={panelRadius}
          onClick={() => {
            setProblem(null);
            setOpen(false);
          }}
        >
          {t('filterEditor.buttons.cancel')}
        </SecondaryButton>
        <PrimaryButton
          type="button"
          data-testid="filter-widget-panel-apply"
          $radius={panelRadius}
          /* Apply is Enter's twin, so it settles the same way: only a draft that parses is
             published, and an entry refused for its format or for not existing is kept in
             view under the closed field with its message, never sent to the owner.

             It has to classify the draft itself. The field commits — and so flags — only on
             blur and on Enter, and a click on Apply is neither: the button lives in the
             portaled panel, which the field counts as its own, so focus never leaves and
             the blur commit does not run. Typing only flags once the mask is FULL, so an
             entry abandoned half-typed (`12/04/2`) reached here carrying no problem at all
             and closed silently. */
          onClick={() => {
            const refused = draft.find((entry) => parseDateInput(mask, entry) === null);
            setProblem(refused === undefined ? null : validateDateInput(mask, refused).problem);
            if (refused === undefined) onChange?.(draft);
            setOpenKeepingRejected(false);
          }}
        >
          {t('filterEditor.buttons.apply')}
        </PrimaryButton>
      </Actions>
    </Foot>
  );

  /* The popover is a non-modal dialog — a panel with a grid and its own footer, not a
     list — named by what it chooses. Non-modal: no focus trap, so Tab walks out, and
     focus leaving the field closes it as a click outside does. */
  const dialogLabel = multiselect
    ? t('filterWidget.calendar.chooseDates')
    : t('filterWidget.calendar.chooseDate');

  /** The calendar on the panel surface, footer under it — the popover both modes open. */
  const panelShell = (calendar: ReactNode) => (
    <Panel
      data-testid="filter-widget-date-panel"
      $radius={panelRadius}
      role="dialog"
      aria-label={dialogLabel}
      /* Up from the footer back into the grid, down from the grid's last row onto it. */
      onKeyDown={(event) => panelArrowNav(event.currentTarget, event)}
    >
      {calendar}
      {foot}
    </Panel>
  );

  if (multiselect) {
    /* Earliest first, so the day the trigger names is the earliest chosen. The Selector
       does the fitting and the `+N` count itself, which is what keeps this reading exactly
       like the members filter. */
    const sortedLabels = [...parsed]
      .sort((a, b) => a.getTime() - b.getTime())
      .map((date) => formatDateInput(mask, date));

    return (
      <Selector
        {...common}
        error={error}
        placeholder={t('filterWidget.calendar.selectDates')}
        popupRole="dialog"
        searchable={false}
        /* Re-clicking the open field must not close it and revert the picked days. */
        openOnly
        trailingIcon="calendar"
        /* Filled: every chosen day, since "which days?" is no answer as "3 days" — and the
           trigger names only the earliest whatever its width, so the rest live here.
           Empty: the hint that the field takes more than one. */
        hint={
          sortedLabels.length
            ? sortedLabels.join(', ')
            : t('filterWidget.calendar.multipleDaysHint')
        }
        names={sortedLabels}
        clearable={active.length > 0}
        /* Open, the clear glyph empties the draft; closed, it clears the field outright. */
        onClear={() => (isOpen ? setDraft([]) : onChange?.([]))}
        popover={
          isOpen
            ? panelShell(
                <CalendarGrid
                  mode="multi"
                  value={parsed}
                  onChange={(picked) => setDraft(picked.map((date) => formatDateInput(mask, date)))}
                  earliestData={earliestData}
                  latestData={latestData}
                  today={today}
                  locale={locale}
                />,
              )
            : null
        }
      />
    );
  }

  const text = (!isOpen && rejected !== null ? rejected : active[0]) ?? '';
  const problemMessage = problem === null ? null : dateProblemMessage(mask, problem);
  return (
    <DateEntry
      {...common}
      mask={mask}
      /* While the calendar is open a flagged entry shows the red border only — no
         message; the message comes once the field closes, Enter or a click-out keeping
         the refused text in view.

         The format message is parameterised and takes the reader's own pattern, so it
         names the shape they were actually asked for; `dateProblemMessage` decides which
         message needs it. */
      error={
        problemMessage ? (isOpen ? true : t(problemMessage.key, problemMessage.values)) : error
      }
      value={text}
      onChange={(next) => {
        /* Typing edits the draft; open the panel so what is typed is what shows. The ref
           marks this open as typing-driven so the re-seed keeps the digit. An empty change
           is the clear glyph, which must not open the calendar. */
        if (next && !isOpen) {
          openedByTyping.current = true;
          setOpen(true);
        }
        setDraft(next ? [next] : []);
        /* Judged the moment the mask is full — an impossible date turns the border red;
           anything shorter is still being typed and carries no flag yet. */
        setProblem(next.length === mask.length ? validateDateInput(mask, next).problem : null);
      }}
      onCommit={(_, raw) => setProblem(validateDateInput(mask, raw).problem)}
      /* Enter is the keyboard Apply — publish the draft. Blur only validates. */
      onSubmit={() => onChange?.(draft)}
      clearable={text.length > 0}
      onClear={() => {
        if (isOpen) setDraft([]);
        else onChange?.([]);
        setRejected(null);
        setProblem(null);
      }}
      popover={
        isOpen
          ? panelShell(
              <CalendarGrid
                mode="single"
                value={parsed[0] ?? null}
                onChange={(picked) => {
                  const pickedText = formatDateInput(mask, picked);
                  setDraft([pickedText]);
                  setProblem(validateDateInput(mask, pickedText).problem);
                }}
                earliestData={earliestData}
                latestData={latestData}
                today={today}
                locale={locale}
              />,
            )
          : null
      }
    />
  );
}
