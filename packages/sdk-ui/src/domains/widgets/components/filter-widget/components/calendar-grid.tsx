/**
 * The date picker's calendar — a single month grid with month/year navigation and the
 * Earliest / Today / Latest quick chips.
 *
 * It picks one day or many, never a span: a range picker has its own design and is not
 * built on this. Chosen neighbours in multi mode band together so a run of consecutive
 * days reads as a range, while the value stays a list of individual days.
 *
 * Every real calendar day is selectable. `earliestData` / `latestData` describe what the
 * data covers, which greys the days beyond it and aims the quick chips — it never blocks a
 * pick, because the data can be queried past its current edges.
 * @internal
 */
import { useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import { panelArrowNav, useRovingFocus } from './calendar-a11y';
import { dayKeyTarget, firstPickable, isGridKey } from './calendar-keys';
import { dayKey } from './date-text';
import { FIELD_RADIUS, panel, spacing, typography } from './design-tokens';
import { fwFallback, fwVar } from './field-palette';
import { Icon } from './icons';

/** Which quick chip was used. @internal */
export type QuickPick = 'earliest' | 'today' | 'latest';

/** Everything the grid takes that does not depend on how many days it holds. */
interface CalendarGridCommonProps {
  /** Visible month, controlled. Any day inside the month will do. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  /** What the data covers — greys the days beyond it and aims the quick chips. */
  earliestData?: Date;
  latestData?: Date;
  weekStartsOn?: 0 | 1;
  /** Injectable so a test renders the same on any day. */
  today?: Date;
  /** Formats the month, weekday and day names. Defaults to the active language. */
  locale?: string;
  className?: string;
}

/**
 * The grid in either shape. `mode` discriminates: `single` holds one day and reports one,
 * `multi` holds a list and reports a list — so a caller cannot pair `single` with an array,
 * and neither callback needs its argument narrowed by hand.
 * @internal
 */
export type CalendarGridProps = CalendarGridCommonProps &
  (
    | {
        /** Picks one day, replacing whatever was held. */
        mode: 'single';
        value?: Date | null;
        onChange?: (value: Date) => void;
      }
    | {
        /** Toggles any number of separate days. */
        mode: 'multi';
        value?: readonly Date[] | null;
        onChange?: (value: readonly Date[]) => void;
      }
  );

/* Half the cell — the full pill a day is drawn as. */
const DAY_RADIUS = `calc(${panel.dayCell} / 2)`;

/* The band under a run of chosen days: the accent, thinned against the surface so the
   solid endpoint circles still read as the ends of the run. */
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
  min-width: calc(${panel.dayCell} * 7);
  font-family: ${fwVar('fontFamily', fwFallback.fontFamily)};
`;

const Chips = styled.div`
  display: flex;
  gap: 12px;
  align-self: flex-start;
  align-items: center;
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
  color: ${fwVar('textPrimary', fwFallback.textPrimary)};
  white-space: nowrap;
  cursor: pointer;
  background: ${fwVar('surfaceMuted', fwFallback.surfaceMuted)};
  border: 0;
  border-radius: ${FIELD_RADIUS.s};
  transition: background-color 0.12s ease;

  &:hover:not(:disabled) {
    background: ${fwVar('border', fwFallback.border)};
  }

  &:disabled {
    color: ${fwVar('textSecondary', fwFallback.textSecondary)};
    cursor: not-allowed;
  }
`;

const Calendar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 0;
`;

/* Each button is one day-cell wide, so the outer pair centres under the first and last
   day columns and the inner pair tucks one column inside them; the growing month label
   fills — and centres over — the middle three columns. */
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

/**
 * Rounds a cell only where its run ends, so consecutive chosen days read as one
 * continuous block per row rather than a string of pills. A lone day is both ends, so
 * every corner rounds. One shorthand — TL TR BR BL — so the longhand corners never fight
 * it across a re-render.
 */
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
  /* Out-of-month days and days beyond the data both read as the secondary grey. */
  color: ${(p) =>
    p.$beyondData || p.$outside
      ? fwVar('textSecondary', fwFallback.textSecondary)
      : fwVar('textPrimary', fwFallback.textPrimary)};
  cursor: pointer;
  /* A day beyond the data is dimmed to say so — but not while it sits in a chosen band,
     where the mute would wash out the fill under it. The grey number still marks it. */
  opacity: ${(p) => (p.$beyondData && !p.$inBand ? 0.45 : 1)};
  background: ${(p) => (p.$inBand ? BAND : 'none')};
  border: 0;
  border-radius: ${(p) => cellRadius(p)};
  transition: background-color 0.12s ease, box-shadow 0.12s ease;
  /* Today is a landmark — an inset ring, not a fill — but it stands down inside a band
     and under a selection, where the fill would only compete with it. */
  box-shadow: ${(p) =>
    p.$today && !p.$inBand
      ? `inset 0 0 0 ${spacing.borderWidth} ${fwVar('border', fwFallback.border)}`
      : 'none'};

  &[aria-selected='true'] {
    box-shadow: none;
  }

  &:hover {
    background: ${(p) =>
      p.$inBand ? BAND : p.$beyondData ? 'none' : fwVar('border', fwFallback.border)};
  }
`;

/**
 * Either end of a run of chosen days — a full circle over the band, so two chosen
 * neighbours read as one block with round ends rather than two notched pills. Primary
 * ink, overriding the out-of-month grey: a day picked from a neighbouring month is still
 * the chosen value.
 */
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

/** Builds six rows always, so the panel keeps one height across months. */
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
  // 2021-08-01 was a Sunday; any known Sunday anchors the sequence.
  const sunday = new Date(2021, 7, 1);
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(addDays(sunday, index + weekStartsOn)),
  );
}

function asDate(value: Date | readonly Date[] | null | undefined): Date | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function asDates(value: Date | readonly Date[] | null | undefined): Date[] {
  if (!value) return [];
  return Array.isArray(value) ? [...value] : [value];
}

/**
 * Renders the date picker's calendar.
 * @param props - Mode, the chosen day(s), the data bounds and the visible month
 * @returns The quick chips and one month grid
 * @internal
 */
export function CalendarGrid({
  mode,
  value,
  onChange,
  month,
  onMonthChange,
  earliestData,
  latestData,
  weekStartsOn = 0,
  today,
  locale,
  className,
}: CalendarGridProps) {
  const { t, i18n } = useTranslation();
  const resolvedLocale = locale ?? i18n.language;
  const now = today ?? new Date();

  const single = mode === 'single' ? asDate(value) : null;
  const multiDays = mode === 'multi' ? asDates(value) : [];
  const isChosenDay = (day: Date) => multiDays.some((chosen) => isSameDay(chosen, day));

  /* Opens on the EARLIEST chosen day, not the first one in the array: a multi selection
     arrives in click order, so reading `value[0]` landed the grid on whichever day happened
     to be picked first. The earliest is also the day the trigger names, so the panel opens
     on the month the closed field was talking about. */
  const [uncontrolledMonth, setUncontrolledMonth] = useState(() => {
    const earliest =
      mode === 'multi'
        ? [...asDates(value)].sort((a, b) => a.getTime() - b.getTime())[0]
        : asDate(value);
    return startOfMonth(earliest ?? now);
  });
  const visibleMonth = month ? startOfMonth(month) : uncontrolledMonth;

  const goToMonth = (next: Date) => {
    if (!month) setUncontrolledMonth(next);
    onMonthChange?.(next);
  };

  /* A date arriving from outside — typed into the field this calendar hangs from — brings
     its own month into view, so the grid and the text never disagree about which month is
     being talked about. Only followed when it is not already on the rendered weeks, so a
     click on a grey neighbouring-month day does not yank the window. */
  const followed = mode === 'single' ? single : null;
  const anchor = followed ? dayKey(followed) : null;
  const [seenAnchor, setSeenAnchor] = useState(anchor);
  if (anchor !== seenAnchor) {
    setSeenAnchor(anchor);
    const weeks = buildWeeks(uncontrolledMonth, weekStartsOn);
    const firstShown = weeks[0][0];
    const lastShown = weeks[5][6];
    const inWindow =
      followed && dayKey(followed) >= dayKey(firstShown) && dayKey(followed) <= dayKey(lastShown);
    if (!month && followed && !inWindow) setUncontrolledMonth(startOfMonth(followed));
  }

  const dayNames = useMemo(
    () => buildDayNames(resolvedLocale, weekStartsOn),
    [resolvedLocale, weekStartsOn],
  );
  const longDayNames = useMemo(
    () => buildDayNames(resolvedLocale, weekStartsOn, 'long'),
    [resolvedLocale, weekStartsOn],
  );

  /* Beyond what the data covers: greyed to say there are no rows out here, never blocked
     — any real calendar day may be chosen. */
  const beyondData = (day: Date) => {
    const key = dayKey(day);
    return (
      (earliestData !== undefined && key < dayKey(earliestData)) ||
      (latestData !== undefined && key > dayKey(latestData))
    );
  };

  const weeks = buildWeeks(visibleMonth, weekStartsOn);
  const monthShown = (day: Date) => isSameMonth(visibleMonth, day);
  const dayShown = (day: Date) =>
    dayKey(day) >= dayKey(weeks[0][0]) && dayKey(day) <= dayKey(weeks[5][6]);

  /** The day the arrows last landed on — the grid's home cell while it is on screen. */
  const [focusDay, setFocusDay] = useState<Date | null>(null);
  const roving = useRovingFocus<HTMLDivElement>();

  /* The one cell the panel's arrows and the field's `↓` enter on: the day the arrows last
     reached, else the selection, else today, else the first day of the visible month. */
  const homeDay: Date = (() => {
    if (focusDay && dayShown(focusDay)) return focusDay;
    const picked =
      mode === 'multi' ? [...multiDays].sort((a, b) => a.getTime() - b.getTime()) : [single];
    const shown = picked.find((day): day is Date => day !== null && monthShown(day));
    if (shown) return shown;
    if (monthShown(now)) return now;
    return visibleMonth;
  })();

  const pickDay = (day: Date) => {
    if (mode === 'single') {
      onChange?.(day);
      return;
    }
    /* Toggle: a day already chosen comes back out, so the same click both adds and
       removes and the calendar needs no separate deselect control. */
    onChange?.(
      isChosenDay(day)
        ? multiDays.filter((chosen) => !isSameDay(chosen, day))
        : [...multiDays, day],
    );
  };

  const onCellKeyDown = (event: KeyboardEvent<HTMLButtonElement>, day: Date) => {
    if (!isGridKey(event.key)) return;
    /* On the grid's edge rows the vertical arrows leave the grid for the chips above and
       the footer below — let them bubble to the panel's own handler. */
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
    // Nothing is blocked, so the first probe always answers; the walk keeps rule 7's shape.
    const target = firstPickable(move.target, move.direction, () => false);
    if (!target) return;
    setFocusDay(target);
    if (!dayShown(target)) goToMonth(startOfMonth(target));
    roving.request();
  };

  const quickPick = (kind: QuickPick) => {
    const target = kind === 'today' ? now : kind === 'earliest' ? earliestData : latestData;
    if (!target) return;
    goToMonth(startOfMonth(target));
    /* The chip acts on its day exactly as clicking that day on the grid would — in
       multi mode that means toggling, so a second press takes it back out. */
    pickDay(target);
  };

  const monthLabel = visibleMonth.toLocaleDateString(resolvedLocale, {
    month: 'short',
    year: 'numeric',
  });
  const gridLabel = visibleMonth.toLocaleDateString(resolvedLocale, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Root
      className={className}
      data-testid="filter-widget-calendar"
      /* Arrows between the chips, the month arrows, the grid and the panel's footer. */
      onKeyDown={(event) => panelArrowNav(event.currentTarget, event)}
    >
      <Chips>
        <Chip
          type="button"
          data-testid="filter-widget-calendar-earliest"
          disabled={!earliestData}
          onClick={() => quickPick('earliest')}
        >
          {t('dateFilter.earliestDate')}
        </Chip>
        <Chip
          type="button"
          data-testid="filter-widget-calendar-today"
          onClick={() => quickPick('today')}
        >
          {t('dateFilter.today')}
        </Chip>
        <Chip
          type="button"
          data-testid="filter-widget-calendar-latest"
          disabled={!latestData}
          onClick={() => quickPick('latest')}
        >
          {t('dateFilter.latestDate')}
        </Chip>
      </Chips>

      <Calendar ref={roving.ref}>
        <Header>
          <Nav>
            <NavButton
              type="button"
              data-testid="filter-widget-calendar-prev-year"
              aria-label={t('filterWidget.calendar.previousYear')}
              onClick={() => goToMonth(addMonths(visibleMonth, -12))}
            >
              <Icon name="doubleArrowLeft" box={12} />
            </NavButton>
            <NavButton
              type="button"
              data-testid="filter-widget-calendar-prev"
              aria-label={t('filterWidget.calendar.previousMonth')}
              onClick={() => goToMonth(addMonths(visibleMonth, -1))}
            >
              <Icon name="arrowLeft" box={12} />
            </NavButton>

            <MonthLabel data-testid="filter-widget-calendar-label" aria-live="polite">
              {monthLabel}
            </MonthLabel>

            <NavButton
              type="button"
              data-testid="filter-widget-calendar-next"
              aria-label={t('filterWidget.calendar.nextMonth')}
              onClick={() => goToMonth(addMonths(visibleMonth, 1))}
            >
              <Icon name="arrowRight" box={12} />
            </NavButton>
            <NavButton
              type="button"
              data-testid="filter-widget-calendar-next-year"
              aria-label={t('filterWidget.calendar.nextYear')}
              onClick={() => goToMonth(addMonths(visibleMonth, 12))}
            >
              <Icon name="doubleArrowRight" box={12} />
            </NavButton>
          </Nav>
        </Header>

        <GridBody role="grid" data-testid="filter-widget-calendar-grid" aria-label={gridLabel}>
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
                /* Chosen neighbours read as a range: a run of consecutive chosen days keeps
                   a full accent circle on its first and last day and paints the band across
                   the days between. A lone day is both ends of a one-day run. */
                const chosen = mode === 'single' ? isSameDay(day, single) : isChosenDay(day);
                const runStart = chosen && (mode === 'single' || !isChosenDay(addDays(day, -1)));
                const runEnd = chosen && (mode === 'single' || !isChosenDay(addDays(day, 1)));
                const isBandStart = chosen && (runStart || dayIndex === 0);
                const isBandEnd = chosen && (runEnd || dayIndex === week.length - 1);

                return (
                  <Cell
                    key={dayIndex}
                    type="button"
                    data-testid="filter-widget-calendar-day"
                    role="gridcell"
                    /* Every day is in the Tab order, so Tab steps from day to day;
                       `data-tabstop` marks the grid's home cell — where the field's `↓` and
                       the panel arrows land. `buildWeeks` renders 42 consecutive days, so a
                       date appears once and matching on the day alone marks exactly one
                       cell. */
                    tabIndex={0}
                    data-tabstop={isSameDay(day, homeDay) ? '' : undefined}
                    data-edge={
                      weekIndex === 0
                        ? 'top'
                        : weekIndex === weeks.length - 1
                        ? 'bottom'
                        : undefined
                    }
                    $outside={!isSameMonth(day, visibleMonth)}
                    $today={isSameDay(day, now)}
                    $inBand={chosen}
                    $bandStart={isBandStart}
                    $bandEnd={isBandEnd}
                    $beyondData={beyondData(day)}
                    /* The same fact the dimming conveys, as a marker a test or an e2e spec
                       can read — asserting the opacity number instead ties them to a
                       design token. Greyed is never blocked (AC-11, AC-23), so this says
                       "outside the covered span", not "unavailable". */
                    data-beyond-data={beyondData(day) ? '' : undefined}
                    aria-selected={chosen}
                    aria-label={day.toLocaleDateString(resolvedLocale, { dateStyle: 'long' })}
                    aria-current={isSameDay(day, now) ? 'date' : undefined}
                    onClick={() => pickDay(day)}
                    onKeyDown={(event) => onCellKeyDown(event, day)}
                    /* A clicked or tabbed-to cell becomes the stop the arrows move from. */
                    onFocus={() => setFocusDay(day)}
                  >
                    {runStart || runEnd ? (
                      <Endpoint>{pad(day.getDate())}</Endpoint>
                    ) : (
                      pad(day.getDate())
                    )}
                  </Cell>
                );
              })}
            </Week>
          ))}
        </GridBody>
      </Calendar>
    </Root>
  );
}
