/**
 * Range's own two-month calendar grid — two consecutive months, an "active end" that the
 * next pick fills, and a band across both grids for the span between From and To.
 *
 * `CalendarGrid` (single/multi) is deliberately not extended for this: it has no concept of
 * two ends, two months, or a band that can span a month boundary, and Calendar/date-Condition
 * anchors — both shipped, both explicitly "not touched" by this ticket — are built on it.
 * This grid instead reuses the same lower-level, already-shared pieces: `calendar-keys.ts`
 * (arrow-key math) and `calendar-a11y.ts` (focus/roving-tabindex) unchanged, `date-text.ts`'s
 * `dayKey` for comparison, and the same design tokens / cell visual language `CalendarGrid`
 * uses — so the two grids read as one family without sharing mutable code.
 * @internal
 */
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import { panelArrowNav, useRovingFocus } from './calendar-a11y';
import { dayKeyTarget, firstPickable, isGridKey } from './calendar-keys';
import { dayKey, formatDateInput } from './date-text';
import type { DateMask } from './date-text';
import { FIELD_RADIUS, panel, spacing, typography } from './design-tokens';
import { fwFallback, fwVar } from './field-palette';
import { Icon } from './icons';
import type { RangeEnd } from './range-date';

/**
 * Which quick chip was used — same vocabulary `CalendarGrid` uses.
 * @internal
 */
export type RangeQuickPick = 'earliest' | 'today' | 'latest';

/**
 * The pair as real `Date`s — what the grid reads and picks against.
 * @internal
 */
export type DateRangeValue = {
  from: Date | null;
  to: Date | null;
};

/** @internal */
export type DateRangePickResult = {
  value: DateRangeValue;
  /** The end a following pick should fill — the hand-off. */
  nextActiveEnd: RangeEnd;
  /** Whether picking this day swapped From and To to keep From the earlier date. */
  reordered: boolean;
};

/** @internal */
export type DateRangeCalendarGridProps = {
  value: DateRangeValue;
  activeEnd: RangeEnd;
  onPick: (result: DateRangePickResult) => void;
  /** Visible left-hand month, controlled. The right grid always shows the month after it. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  earliestData?: Date;
  latestData?: Date;
  weekStartsOn?: 0 | 1;
  /** Injectable so a test renders the same on any day. */
  today?: Date;
  locale?: string;
  /** The reader's date format — formats the range readout the same way the fields read. */
  mask: DateMask;
  className?: string;
};

const DAY_RADIUS = `calc(${panel.dayCell} / 2)`;

const BAND = `color-mix(in srgb, ${fwVar('accent', fwFallback.accent)} 30%, ${fwVar(
  'bg',
  fwFallback.bg,
)})`;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${panel.gap};
  align-items: flex-start;
  box-sizing: border-box;
  font-family: ${fwVar('fontFamily', fwFallback.fontFamily)};
`;

const Chips = styled.div`
  display: flex;
  gap: 12px;
  align-self: stretch;
  align-items: center;
  width: 100%;
`;

/* The range readout — a chip-shaped, inert echo of the picked span at the row's far end
   (`margin-left: auto` needs `Chips` to stretch full width, above). Before either end is
   picked it shows the data's own earliest/latest bound instead — matching the prototype's
   `CalendarPicker` `rangeReadout`. Muted (textSecondary), the opposite weight from `Chip`'s
   own primary ink (2026-09-22): an inert echo should read quieter than the buttons next to
   it, whichever end fills it — the `data-missing` marker stays on the placeholder text for
   its own sake (tests, a future distinction) even though both now share one colour. */
const Readout = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  height: ${spacing.iconM};
  margin-left: auto;
  padding: 0 ${spacing.m};
  font-size: ${typography.paragraph.size};
  line-height: ${typography.paragraph.lineHeight};
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
  white-space: nowrap;
  background: ${fwVar('surfaceMuted', fwFallback.surfaceMuted)};
  border-radius: ${FIELD_RADIUS.s};
`;

const Chip = styled.button`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  height: ${spacing.iconM};
  padding: 0 ${spacing.m};
  font-family: inherit;
  font-size: ${typography.paragraph.size};
  line-height: ${typography.paragraph.lineHeight};
  white-space: nowrap;
  cursor: pointer;
  background: ${fwVar('surfaceMuted', fwFallback.surfaceMuted)};
  border: 0;
  border-radius: ${FIELD_RADIUS.s};
  transition: background-color 0.12s ease;

  /* Doubled so a host \`button\` reset cannot keep its own ink on this native button —
     the same reasoning \`FieldInput\` doubles its own color rule for (field.tsx). */
  && {
    color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  }

  &:hover:not(:disabled) {
    background: ${fwVar('border', fwFallback.border)};
  }

  &&:disabled {
    color: ${fwVar('textSecondary', fwFallback.textSecondary)};
    cursor: not-allowed;
  }
`;

const Months = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${panel.gap};
`;

const Calendar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 0;
`;

const Nav = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const NavButton = styled.button`
  display: inline-flex;
  flex: 0 0 auto;
  width: ${panel.dayCell};
  align-items: center;
  justify-content: center;
  padding: 0;
  color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  cursor: pointer;
  background: none;
  border: 0;

  &:disabled {
    visibility: hidden;
  }
`;

const MonthLabel = styled.span`
  flex: 1 1 auto;
  font-size: ${typography.paragraph.size};
  font-weight: 700;
  line-height: ${typography.paragraph.lineHeight};
  color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  text-align: center;
  white-space: nowrap;
`;

const GridBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const DayNames = styled.div`
  display: flex;
  align-items: center;
`;

const DayName = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: ${panel.dayCell};
  height: ${panel.dayCell};
  font-size: ${typography.paragraph.size};
  font-weight: 700;
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
`;

const Week = styled.div`
  display: flex;
  align-items: center;
`;

type CellStyleProps = {
  $outside: boolean;
  $today: boolean;
  $inBand: boolean;
  $bandStart: boolean;
  $bandEnd: boolean;
  $beyondData: boolean;
};

function cellRadius(style: Pick<CellStyleProps, '$inBand' | '$bandStart' | '$bandEnd'>): string {
  if (!style.$inBand) return DAY_RADIUS;
  const left = style.$bandStart ? DAY_RADIUS : '0';
  const right = style.$bandEnd ? DAY_RADIUS : '0';
  return `${left} ${right} ${right} ${left}`;
}

const Cell = styled.button<CellStyleProps>`
  position: relative;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: ${panel.dayCell};
  height: ${panel.dayCell};
  padding: 0;
  font-family: inherit;
  font-size: ${typography.paragraph.size};
  color: ${(p) =>
    p.$beyondData || p.$outside
      ? fwVar('textSecondary', fwFallback.textSecondary)
      : fwVar('textPrimary', fwFallback.textPrimary)};
  cursor: pointer;
  opacity: ${(p) => (p.$beyondData && !p.$inBand ? 0.45 : 1)};
  background: ${(p) => (p.$inBand ? BAND : 'none')};
  border: 0;
  border-radius: ${(p) => cellRadius(p)};
  transition: background-color 0.12s ease, box-shadow 0.12s ease;
  box-shadow: ${(p) =>
    p.$today && !p.$inBand
      ? `inset 0 0 0 ${spacing.borderWidth} ${fwVar('border', fwFallback.border)}`
      : 'none'};
  /* Cropped, not spilled (product direction, 2026-09-22): a neighbouring month's day keeps
     its grid slot, so every week stays 7 cells wide and every month's weeks line up, but
     draws nothing — visibility, not display:none, is what keeps the slot's layout. */
  visibility: ${(p) => (p.$outside ? 'hidden' : 'visible')};

  &[aria-selected='true'] {
    box-shadow: none;
  }

  &:hover {
    background: ${(p) =>
      p.$inBand ? BAND : p.$beyondData ? 'none' : fwVar('border', fwFallback.border)};
  }
`;

const Endpoint = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  background: ${fwVar('accent', fwFallback.accent)};
  border-radius: ${DAY_RADIUS};
`;

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function pad(day: number): string {
  return String(day).padStart(2, '0');
}

function buildWeeks(month: Date, weekStartsOn: 0 | 1): Date[][] {
  const offset = (month.getDay() - weekStartsOn + 7) % 7;
  const first = addDays(month, -offset);
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(first, week * 7 + day)),
  );
}

function buildDayNames(
  locale: string,
  weekStartsOn: 0 | 1,
  width: 'narrow' | 'long' = 'narrow',
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: width });
  const sunday = new Date(2021, 7, 1);
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(addDays(sunday, index + weekStartsOn)),
  );
}

/**
 * In order regardless of which end is earlier — a mid-edit draft may briefly be inverted.
 * @param value - The range as picked so far, either end possibly unset.
 * @returns The pair relabeled `start`/`end` so `start` is never later than `end`.
 */
function orderedBounds(value: DateRangeValue): { start: Date | null; end: Date | null } {
  if (value.from && value.to && dayKey(value.from) > dayKey(value.to)) {
    return { start: value.to, end: value.from };
  }
  return { start: value.from, end: value.to };
}

/**
 * Renders Range's two-month calendar.
 * @param props - The pair, the active end, the data bounds and the visible month pair.
 * @returns The quick chips and two consecutive month grids.
 * @internal
 */
export function DateRangeCalendarGrid(props: DateRangeCalendarGridProps) {
  const {
    value,
    activeEnd,
    onPick,
    month,
    onMonthChange,
    earliestData,
    latestData,
    weekStartsOn = 0,
    today,
    locale,
    mask,
    className,
  } = props;
  const { t, i18n } = useTranslation();
  const resolvedLocale = locale ?? i18n.language;
  const now = today ?? new Date();

  const [uncontrolledMonth, setUncontrolledMonth] = useState(() =>
    startOfMonth(value.from ?? value.to ?? now),
  );
  const leftMonth = month ? startOfMonth(month) : uncontrolledMonth;
  const rightMonth = addMonths(leftMonth, 1);

  const goToMonth = (next: Date) => {
    if (!month) setUncontrolledMonth(next);
    onMonthChange?.(next);
  };

  /* A date arriving from outside — typed into the field the calendar hangs from — brings
     its own month into view, so the grid and the field never disagree about which month is
     being talked about; matches the prototype's own `CalendarPicker` follow logic. Follows
     only the ACTIVE end (the one the next pick would fill), and only when its month isn't
     already shown — an in-window edit must not yank the window out from under a pick in
     progress on the other grid. Render-time state comparison (not `useEffect`), so the
     scroll lands in the same paint as the edit that caused it. */
  /* The active end's own value — but a hand-off that just fired leaves the NEW active end
     still empty (its own pick/type hasn't happened yet), so falling back to the other end
     keeps following the date that was actually just entered, not `null` (prototype's own
     `anchorDate`: `activeEnd === 'end' ? (r.end ?? r.start) : (r.start ?? r.end)`). */
  const followedDate = activeEnd === 'to' ? value.to ?? value.from : value.from ?? value.to;
  const followedKey = followedDate ? dayKey(followedDate) : null;
  const [seenFollowedKey, setSeenFollowedKey] = useState(followedKey);
  if (followedKey !== seenFollowedKey) {
    setSeenFollowedKey(followedKey);
    if (followedDate && !month) {
      const firstShown = buildWeeks(leftMonth, weekStartsOn)[0][0];
      const lastShown = buildWeeks(rightMonth, weekStartsOn)[5][6];
      const inWindow =
        dayKey(followedDate) >= dayKey(firstShown) && dayKey(followedDate) <= dayKey(lastShown);
      if (!inWindow) {
        /* A pinned To whose month differs from From's puts the followed date on the
           RIGHT grid instead — the earlier month gives the span room on the left — the
           same as a To pick opening the window one month back (prototype rule 8). */
        const windowStart =
          activeEnd === 'to' && value.from && !isSameMonth(value.from, followedDate)
            ? addMonths(startOfMonth(followedDate), -1)
            : startOfMonth(followedDate);
        goToMonth(windowStart);
      }
    }
  }

  const dayNames = buildDayNames(resolvedLocale, weekStartsOn);
  const longDayNames = buildDayNames(resolvedLocale, weekStartsOn, 'long');

  const beyondData = (day: Date) => {
    const key = dayKey(day);
    return (
      (earliestData !== undefined && key < dayKey(earliestData)) ||
      (latestData !== undefined && key > dayKey(latestData))
    );
  };

  const { start: bandStart, end: bandEnd } = orderedBounds(value);
  const inBand = (day: Date) => {
    if (!bandStart || !bandEnd) return isSameDay(day, bandStart) || isSameDay(day, bandEnd);
    const key = dayKey(day);
    return key >= dayKey(bandStart) && key <= dayKey(bandEnd);
  };

  const [focusDay, setFocusDay] = useState<Date | null>(null);
  const leftRoving = useRovingFocus<HTMLDivElement>();
  const rightRoving = useRovingFocus<HTMLDivElement>();

  /**
   * Fills `end` (a day-cell click leaves it at its default, `activeEnd`; the Earliest/Latest
   * chips pin it explicitly — see `quickPick`), keeps the other end, and swaps if the result
   * is inverted (From is always kept the earlier date) — then hands off to whichever
   * end the pick did not just fill, matching the prototype's own `pickDay`
   * rules 3-4.
   * @param day - The day just picked.
   * @param end - Which end to fill; defaults to `activeEnd` (a day-cell click doesn't pass
   * this — only the quick chips do).
   */
  const pickDay = (day: Date, end: RangeEnd = activeEnd) => {
    let next: DateRangeValue =
      end === 'from' ? { from: day, to: value.to } : { from: value.from, to: day };

    const reordered = Boolean(next.from && next.to && dayKey(next.from) > dayKey(next.to));
    if (reordered) next = { from: next.to, to: next.from };

    let nextActiveEnd: RangeEnd = end === 'from' ? 'to' : 'from';
    if (reordered) nextActiveEnd = nextActiveEnd === 'from' ? 'to' : 'from';

    onPick({ value: next, nextActiveEnd, reordered });
  };

  const onCellKeyDown = (event: KeyboardEvent<HTMLButtonElement>, day: Date) => {
    if (!isGridKey(event.key)) return;
    const edge = event.currentTarget.getAttribute('data-edge') ?? '';
    if (
      (event.key === 'ArrowDown' && edge.includes('bottom')) ||
      (event.key === 'ArrowUp' && edge.includes('top'))
    ) {
      return;
    }
    const move = dayKeyTarget(event.key, event.shiftKey, day, weekStartsOn);
    if (!move) return;
    event.preventDefault();
    const target = firstPickable(move.target, move.direction, () => false);
    if (!target) return;
    setFocusDay(target);
    const shownLeft = isSameMonth(leftMonth, target);
    const shownRight = isSameMonth(rightMonth, target);
    /* Left of the left month, or right of the right month: page the pair to follow,
       landing the target in whichever side it belongs on — not `weeks[0][0]`, a single
       grid's own rendered window, which only ever agreed with "before/after the pair" by
       coincidence and put a PageDown target from the right grid two months out back under
       an unmoved pair (the fallback `leftMonth` branch), stranding `homeDay` on a day
       outside every rendered window. */
    const nextLeftMonth =
      !shownLeft && !shownRight
        ? dayKey(target) < dayKey(leftMonth)
          ? startOfMonth(target)
          : addMonths(startOfMonth(target), -1)
        : leftMonth;
    if (!shownLeft && !shownRight) {
      goToMonth(nextLeftMonth);
    }
    (isSameMonth(addMonths(nextLeftMonth, 1), target) ? rightRoving : leftRoving).request();
  };

  /* Earliest/Latest are pinned to From/To — not `activeEnd` — so clicking "Earliest
     date" while To is the active field still fills From, exactly like the prototype's own
     `quickPick` (`kind === 'earliest' ? onChange({start: target, ...}) : ...`). Only Today
     follows the active field, standing in for picking today on the grid. */
  const quickPick = (kind: RangeQuickPick) => {
    const target = kind === 'today' ? now : kind === 'earliest' ? earliestData : latestData;
    if (!target) return;
    goToMonth(isSameMonth(target, rightMonth) ? addMonths(target, -1) : startOfMonth(target));
    if (kind === 'today') pickDay(target);
    else pickDay(target, kind === 'earliest' ? 'from' : 'to');
  };

  const renderMonth = (
    visibleMonth: Date,
    roving: ReturnType<typeof useRovingFocus<HTMLDivElement>>,
    side: 'left' | 'right',
  ) => {
    const weeks = buildWeeks(visibleMonth, weekStartsOn);
    /* Cropped, not spilled: a leading/trailing week's days from the neighbouring month are
       blanked (visibility:hidden, below) rather than drawn — so a focus target must be a day
       of THIS month, same as a click target. */
    const monthShown = (day: Date) => isSameMonth(visibleMonth, day);

    const homeDay: Date = (() => {
      if (focusDay && monthShown(focusDay)) return focusDay;
      const active = activeEnd === 'from' ? value.from : value.to;
      if (active && monthShown(active)) return active;
      if (monthShown(now)) return now;
      return visibleMonth;
    })();

    const monthLabel = visibleMonth.toLocaleDateString(resolvedLocale, {
      month: 'short',
      year: 'numeric',
    });
    const gridLabel = visibleMonth.toLocaleDateString(resolvedLocale, {
      month: 'long',
      year: 'numeric',
    });

    return (
      <Calendar ref={roving.ref}>
        <Header>
          <Nav>
            {/* Year jumps sit at the pair's own outer edges — prev-year beside the left
                grid's prev-month, next-year beside the right grid's next-month — the same
                pairing Calendar's own single-month grid uses (`calendar-grid.tsx`). The
                inner edges (next-year on the left grid, prev-year on the right) are hidden
                the same way the inner month arrows already are. */}
            <NavButton
              type="button"
              data-testid={`filter-widget-date-range-prev-year-${side}`}
              aria-label={t('filterWidget.calendar.previousYear')}
              disabled={side === 'right'}
              onClick={() => goToMonth(addMonths(leftMonth, -12))}
            >
              <Icon name="doubleArrowLeft" box={12} />
            </NavButton>
            <NavButton
              type="button"
              data-testid={`filter-widget-date-range-prev-${side}`}
              aria-label={t('filterWidget.calendar.previousMonth')}
              disabled={side === 'right'}
              onClick={() => goToMonth(addMonths(leftMonth, -1))}
            >
              <Icon name="arrowLeft" box={12} />
            </NavButton>
            <MonthLabel data-testid={`filter-widget-date-range-label-${side}`} aria-live="polite">
              {monthLabel}
            </MonthLabel>
            <NavButton
              type="button"
              data-testid={`filter-widget-date-range-next-${side}`}
              aria-label={t('filterWidget.calendar.nextMonth')}
              disabled={side === 'left'}
              onClick={() => goToMonth(addMonths(leftMonth, 1))}
            >
              <Icon name="arrowRight" box={12} />
            </NavButton>
            <NavButton
              type="button"
              data-testid={`filter-widget-date-range-next-year-${side}`}
              aria-label={t('filterWidget.calendar.nextYear')}
              disabled={side === 'left'}
              onClick={() => goToMonth(addMonths(leftMonth, 12))}
            >
              <Icon name="doubleArrowRight" box={12} />
            </NavButton>
          </Nav>
        </Header>

        <GridBody
          role="grid"
          data-testid={`filter-widget-date-range-grid-${side}`}
          aria-label={gridLabel}
        >
          <DayNames role="row">
            {dayNames.map((name, index) => (
              <DayName key={index} role="columnheader" aria-label={longDayNames[index]}>
                {name}
              </DayName>
            ))}
          </DayNames>

          {weeks.map((week, weekIndex) => (
            <Week key={weekIndex} role="row">
              {week.map((day, dayIndex) => {
                const outside = !isSameMonth(day, visibleMonth);
                /* A blanked spillover cell is never banded: the band's row ends land on the
                   last VISIBLE cell instead, so a rounded band edge never sits on an invisible
                   day (the prototype's own `hideOutsideDays` reasoning). */
                const chosen = !outside && inBand(day);
                const isBandStart = chosen && (isSameDay(day, bandStart) || dayIndex === 0);
                const isBandEnd =
                  chosen && (isSameDay(day, bandEnd) || dayIndex === week.length - 1);
                const isEndpoint = isSameDay(day, bandStart) || isSameDay(day, bandEnd);

                return (
                  <Cell
                    key={dayIndex}
                    type="button"
                    data-testid="filter-widget-date-range-day"
                    role="gridcell"
                    tabIndex={outside ? -1 : 0}
                    aria-hidden={outside || undefined}
                    data-tabstop={!outside && isSameDay(day, homeDay) ? '' : undefined}
                    data-edge={
                      weekIndex === 0
                        ? 'top'
                        : weekIndex === weeks.length - 1
                        ? 'bottom'
                        : undefined
                    }
                    $outside={outside}
                    $today={isSameDay(day, now)}
                    $inBand={chosen}
                    $bandStart={isBandStart}
                    $bandEnd={isBandEnd}
                    $beyondData={beyondData(day)}
                    data-beyond-data={!outside && beyondData(day) ? '' : undefined}
                    aria-selected={chosen}
                    aria-label={day.toLocaleDateString(resolvedLocale, { dateStyle: 'long' })}
                    aria-current={isSameDay(day, now) ? 'date' : undefined}
                    onClick={() => {
                      if (!outside) pickDay(day);
                    }}
                    onKeyDown={(event) => onCellKeyDown(event, day)}
                    onFocus={() => setFocusDay(day)}
                  >
                    {isEndpoint ? <Endpoint>{pad(day.getDate())}</Endpoint> : pad(day.getDate())}
                  </Cell>
                );
              })}
            </Week>
          ))}
        </GridBody>
      </Calendar>
    );
  };

  return (
    <Root
      className={className}
      data-testid="filter-widget-date-range-calendar"
      onKeyDown={(event) => panelArrowNav(event.currentTarget, event)}
    >
      <Chips>
        <Chip
          type="button"
          data-testid="filter-widget-date-range-earliest"
          disabled={!earliestData}
          onClick={() => quickPick('earliest')}
        >
          {t('dateFilter.earliestDate')}
        </Chip>
        <Chip
          type="button"
          data-testid="filter-widget-date-range-today"
          onClick={() => quickPick('today')}
        >
          {t('dateFilter.today')}
        </Chip>
        <Chip
          type="button"
          data-testid="filter-widget-date-range-latest"
          disabled={!latestData}
          onClick={() => quickPick('latest')}
        >
          {t('dateFilter.latestDate')}
        </Chip>
        <Readout aria-live="polite" data-testid="filter-widget-date-range-readout">
          {value.from ? (
            formatDateInput(mask, value.from)
          ) : (
            <span data-missing="">
              {earliestData ? formatDateInput(mask, earliestData) : mask.template}
            </span>
          )}
          <span data-missing={value.from && value.to ? undefined : ''}>&nbsp;–&nbsp;</span>
          {value.to ? (
            formatDateInput(mask, value.to)
          ) : (
            <span data-missing="">
              {latestData ? formatDateInput(mask, latestData) : mask.template}
            </span>
          )}
        </Readout>
      </Chips>

      <Months>
        {renderMonth(leftMonth, leftRoving, 'left')}
        {renderMonth(rightMonth, rightRoving, 'right')}
      </Months>
    </Root>
  );
}
