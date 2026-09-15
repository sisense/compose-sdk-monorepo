import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarGrid } from '../calendar-grid';
import { DatePickerFilter } from '../date-picker-filter';

/**
 * The Calendar filter type, rendered as a spec sheet.
 *
 * Every story pins `today` and the data bounds, so the grid draws the same month whenever
 * it is reviewed — a calendar left to `new Date()` would re-baseline every screenshot.
 *
 * These cover the axes unit tests cannot: the two shapes the Multi-select setting switches
 * between, how a run of chosen days bands together, which days are drawn as beyond the
 * data, and what the control looks like under a Look and Feel palette.
 *
 * The field's own date format follows the app's locale, so the stories below read
 * `MM/DD/YYYY` — Storybook has no Sisense app and falls back to the `en-US` language. The
 * grid takes its locale as a prop, so `GridLocalised` shows what another one looks like.
 */
const meta: Meta<typeof DatePickerFilter> = {
  title: 'Widgets/FilterWidget/Calendar',
  component: DatePickerFilter,
  parameters: { layout: 'padded' },
};
export default meta;

/** November 2009, the month the sample data starts in. */
const TODAY = new Date(2009, 10, 26);
const EARLIEST = new Date(2009, 10, 26);
const LATEST = new Date(2013, 4, 15);

const bounds = { today: TODAY, earliestData: EARLIEST, latestData: LATEST };

type Story = StoryObj<typeof DatePickerFilter>;

/** Single select, closed: a typeable field showing the `MM/DD/YYYY` ghost. */
export const SingleEmpty: Story = {
  args: { ...bounds },
};

/** Single select with a committed day. */
export const SingleFilled: Story = {
  args: { ...bounds, value: ['12/01/2009'] },
};

/**
 * The panel a single-select field opens: the quick chips, the month grid and the
 * Clear / Cancel / Apply footer. Days before the data's first day are greyed — and still
 * selectable, which is the point of drawing them differently rather than disabling them.
 */
export const SingleOpen: Story = {
  args: { ...bounds, value: ['12/01/2009'], open: true },
};

/**
 * A refused entry, as it reads once the field has closed: the text stays in view with its
 * message so the reader can see what was refused, rather than snapping back.
 */
export const SingleRefusedEntry: Story = {
  args: { ...bounds, value: ['02/31/2026'] },
};

/** Multi select, closed: the earliest chosen day named, the rest behind a `+N` count. */
export const MultiFilled: Story = {
  args: {
    ...bounds,
    multiselect: true,
    value: ['12/01/2009', '12/02/2009', '12/03/2009', '12/20/2009'],
  },
};

/**
 * Multi select open on a run of consecutive days. The run keeps a full accent circle on
 * its first and last day and bands across the days between, so it reads as a range while
 * the query still carries the days one by one.
 */
export const MultiOpenWithRun: Story = {
  args: {
    ...bounds,
    multiselect: true,
    open: true,
    value: ['12/01/2009', '12/02/2009', '12/03/2009'],
  },
};

/** Under a Look and Feel palette — every part of the control follows the theme. */
export const Themed: Story = {
  args: {
    ...bounds,
    open: true,
    value: ['12/01/2009'],
    radius: 'l',
    controlStyle: {
      primaryText: '#f4f4f8',
      secondaryText: '#9ea2ab',
      background: '#2b2f3a',
      borderColor: '#4a4f5c',
      accentColor: '#ffb547',
    },
  },
};

/** The month grid on its own, so the day states are reviewable without a field around it. */
export const GridSingle: StoryObj<typeof CalendarGrid> = {
  render: (args) => <CalendarGrid {...args} />,
  args: { mode: 'single', value: new Date(2009, 11, 1), ...bounds },
};

/**
 * The grid under a German locale: the month label and the weekday headers come from the
 * locale, and every day's accessible name with them. The field beside it would read
 * `DD.MM.YYYY` — the same locale drives both.
 */
export const GridLocalised: StoryObj<typeof CalendarGrid> = {
  render: (args) => <CalendarGrid {...args} />,
  args: {
    mode: 'single',
    value: new Date(2009, 11, 1),
    locale: 'de-DE',
    weekStartsOn: 1,
    ...bounds,
  },
};

/** The grid in multi mode, showing a banded run plus a day on its own. */
export const GridMulti: StoryObj<typeof CalendarGrid> = {
  render: (args) => <CalendarGrid {...args} />,
  args: {
    mode: 'multi',
    value: [
      new Date(2009, 11, 1),
      new Date(2009, 11, 2),
      new Date(2009, 11, 3),
      new Date(2009, 11, 20),
    ],
    ...bounds,
  },
};
