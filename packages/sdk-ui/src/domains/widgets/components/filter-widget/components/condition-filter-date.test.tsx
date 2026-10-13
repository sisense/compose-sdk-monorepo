/** @vitest-environment jsdom */
import { DateLevels, DimensionalLevelAttribute, filterFactory } from '@sisense/sdk-data';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  defaultDateConditionDraft,
  forgetAllIncompleteDateDrafts,
  rememberIncompleteDateDraft,
} from './condition-date.js';
import { ConditionFilterDate } from './condition-filter-date.js';
import { DEFAULT_DATE_MASK } from './date-text.js';

/** English word order — mirrors the real `en.ts` templates so key-echoing assertions still read
 *  naturally, and proves `summariseDateCondition` composes via one interpolated `t()` call. */
const SUMMARY_TEMPLATES: Record<string, string> = {
  'filterWidget.dateCondition.summary.current': '{{operator}} {{grain}}',
  'filterWidget.dateCondition.summary.relative': '{{operator}} {{count}} {{grain}}',
  'filterWidget.dateCondition.summary.relativeIncludingCurrent':
    '{{operator}} {{count}} {{grain}} {{includingCurrent}}',
  'filterWidget.dateCondition.summary.date': '{{operator}} {{date}}',
};

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: { format?: string } | string | Record<string, unknown>) => {
        if (typeof options === 'string') return options;
        if (options && typeof options === 'object' && 'format' in options && options.format) {
          return `${key}(${options.format as string})`;
        }
        if (options && typeof options === 'object' && key in SUMMARY_TEMPLATES) {
          return SUMMARY_TEMPLATES[key].replace(/\{\{(\w+)\}\}/g, (_match, placeholder: string) =>
            String((options as Record<string, unknown>)[placeholder] ?? ''),
          );
        }
        return key;
      },
      i18n: { language: 'en-US' },
    }),
  };
});

vi.mock('./use-date-mask', () => ({
  useDateMask: () => ({ mask: DEFAULT_DATE_MASK, locale: 'en-US' }),
}));

const years = new DimensionalLevelAttribute(
  'Years',
  '[Commerce.Date (Calendar)]',
  DateLevels.Years,
  'yyyy',
);

const TODAY = new Date(2026, 8, 11);

const setup = () => {
  const onFilterUpdate = vi.fn();
  const result = render(
    <ConditionFilterDate attribute={years} today={TODAY} onFilterUpdate={onFilterUpdate} />,
  );
  return { onFilterUpdate, ...result };
};

describe('ConditionFilterDate', () => {
  afterEach(() => {
    forgetAllIncompleteDateDrafts();
  });

  it('keeps Set filter on the closed trigger until Apply', () => {
    setup();
    expect(screen.getByTestId('filter-widget-condition-trigger')).toHaveValue(
      'filterWidget.placeholders.setFilter',
    );
  });

  it('publishes Last 1 Year on Apply and does not publish on Cancel', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = setup();

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    expect(screen.getByTestId('filter-widget-condition-panel')).toBeInTheDocument();
    expect(screen.getByTestId('filter-widget-condition-trigger')).toHaveValue(
      'filterEditor.relativeTypes.last 1 filterEditor.datetimeLevels.year',
    );
    await user.click(screen.getByTestId('filter-widget-panel-cancel'));
    expect(onFilterUpdate).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    await user.click(screen.getByTestId('filter-widget-panel-apply'));
    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(onFilterUpdate.mock.calls[0][0].filterJaql()).toEqual({ last: { offset: 1, count: 1 } });
  });

  it('opens Last with a count of 1, and flags a count of 0 at once and refuses it on Apply', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = setup();

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    const count = screen.getByTestId('filter-widget-condition-count');
    expect(count).toHaveValue('1');

    await user.clear(count);
    await user.type(count, '0');
    // Flagged as soon as it is typed, before any Apply.
    expect(screen.getByText('filterWidget.dateCondition.countMin')).toBeInTheDocument();
    expect(count).toHaveAttribute('aria-invalid', 'true');

    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.getByTestId('filter-widget-condition-panel')).toBeInTheDocument();
    expect(screen.getByText('filterWidget.dateCondition.countMin')).toBeInTheDocument();

    // An emptied count is not flagged while typing — Apply clears it as an unfinished draft.
    await user.clear(count);
    expect(screen.queryByText('filterWidget.dateCondition.countMin')).not.toBeInTheDocument();
  });

  it('reopens a remembered Last draft parked on a count of 0 at the default 1', async () => {
    const user = userEvent.setup();
    rememberIncompleteDateDraft(years.expression, {
      ...defaultDateConditionDraft(),
      count: '0',
      includingCurrent: true,
    });
    setup();

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));

    expect(screen.getByTestId('filter-widget-condition-count')).toHaveValue('1');
  });

  it('reads Set filter in the field after Clear, until the reset draft is edited', async () => {
    const user = userEvent.setup();
    const onFilterUpdate = vi.fn();
    // Last 3 years — something other than the default the panel's Clear resets to.
    const applied = filterFactory.dateRelativeTo(years, 1, 3);
    render(
      <ConditionFilterDate
        attribute={years}
        filter={applied}
        today={TODAY}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    const trigger = () => screen.getByTestId('filter-widget-condition-trigger');

    await user.click(trigger());
    await user.click(screen.getByTestId('filter-widget-panel-clear'));

    // The draft is back at Last 1 Year, but nothing has been picked: Set filter, like ✕.
    expect(screen.getByTestId('filter-widget-condition-count')).toHaveValue('1');
    expect(trigger()).toHaveValue('');
    expect(trigger()).toHaveAttribute('placeholder', 'filterWidget.placeholders.setFilter');

    // The first edit brings the draft's summary back.
    await user.click(screen.getByTestId('filter-widget-condition-including-current'));
    expect(trigger()).not.toHaveValue('');

    await user.click(screen.getByTestId('filter-widget-panel-apply'));
    expect(onFilterUpdate.mock.calls[0][0].filterJaql()).toEqual({ last: { offset: 0, count: 1 } });
  });

  it('includes the current period when the checkbox is on', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate, rerender } = setup();

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    await user.click(screen.getByTestId('filter-widget-condition-including-current'));
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    const published = onFilterUpdate.mock.calls[0][0];
    expect(published.filterJaql()).toEqual({ last: { offset: 0, count: 1 } });

    /* Closed-trigger sentence goes through its own summary.relativeIncludingCurrent template,
       not a JS-side `${sentence} ${includingCurrentLabel}` glue — feed the published filter
       back in, the way a host re-renders from its own linked-filter state after Apply. */
    rerender(
      <ConditionFilterDate
        attribute={years}
        today={TODAY}
        onFilterUpdate={onFilterUpdate}
        filter={published}
      />,
    );
    expect(screen.getByTestId('filter-widget-condition-trigger')).toHaveValue(
      'filterEditor.relativeTypes.last 1 filterEditor.datetimeLevels.year including current',
    );
  });

  it('keeps the panel open when Before is applied with a nonexistent date', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = setup();

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    await user.click(screen.getByTestId('filter-widget-condition-operator'));
    const before = screen
      .getAllByTestId('filter-widget-select-option')
      .find((node) => node.textContent === 'filterEditor.datetimePositions.before');
    expect(before).toBeDefined();
    await user.click(before!);

    const anchor = screen.getByTestId('filter-widget-condition-anchor');
    await user.type(anchor, '02/31/2026');
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.getByTestId('filter-widget-condition-panel')).toBeInTheDocument();
  });

  it('publishes Before as an exclusive Day-level toNotEqual after a calendar pick, like text Apply', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate } = setup();

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    await user.click(screen.getByTestId('filter-widget-condition-operator'));
    const before = screen
      .getAllByTestId('filter-widget-select-option')
      .find((node) => node.textContent === 'filterEditor.datetimePositions.before');
    expect(before).toBeDefined();
    await user.click(before!);

    await user.click(screen.getByTestId('filter-widget-condition-anchor'));
    const fifteenth = screen
      .getAllByTestId('filter-widget-calendar-day')
      .find((node) => node.textContent === '15');
    expect(fifteenth).toBeDefined();
    await user.click(fifteenth!);
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    const published = onFilterUpdate.mock.calls[0][0];
    expect(published.filterJaql()).toEqual({
      toNotEqual: '2026-09-15',
      isAdvanced: true,
      custom: true,
    });
    expect(published.attribute.granularity).toBe(DateLevels.Days);
    expect(screen.queryByTestId('filter-widget-condition-panel')).not.toBeInTheDocument();
  });

  it('keeps Before after empty-date Apply — Set filter on the closed trigger, Before on reopen', async () => {
    const user = userEvent.setup();
    const { onFilterUpdate, unmount } = setup();

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    await user.click(screen.getByTestId('filter-widget-condition-operator'));
    const before = screen
      .getAllByTestId('filter-widget-select-option')
      .find((node) => node.textContent === 'filterEditor.datetimePositions.before');
    expect(before).toBeDefined();
    await user.click(before!);
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    expect(onFilterUpdate).toHaveBeenCalledWith(null);
    expect(screen.queryByTestId('filter-widget-condition-panel')).not.toBeInTheDocument();
    expect(screen.getByTestId('filter-widget-condition-trigger')).toHaveValue(
      'filterWidget.placeholders.setFilter',
    );

    unmount();
    render(<ConditionFilterDate attribute={years} today={TODAY} onFilterUpdate={onFilterUpdate} />);

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    expect(screen.getByTestId('filter-widget-condition-operator')).toHaveValue(
      'filterEditor.datetimePositions.before',
    );
    expect(screen.queryByTestId('filter-widget-condition-count')).not.toBeInTheDocument();
    expect(screen.getByTestId('filter-widget-condition-anchor')).toBeInTheDocument();
  });

  it('does not leak an incomplete Before draft between two widgets on the same date column', async () => {
    const user = userEvent.setup();
    const onFilterUpdate = vi.fn();
    const widgetAFilter = filterFactory.members(years, [], { guid: 'widget-a-guid' });
    const { unmount } = render(
      <ConditionFilterDate
        attribute={years}
        filter={widgetAFilter}
        today={TODAY}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    // Widget A: pick Before, leave the date blank, Apply — remembers Before for widget A only.
    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    await user.click(screen.getByTestId('filter-widget-condition-operator'));
    const before = screen
      .getAllByTestId('filter-widget-select-option')
      .find((node) => node.textContent === 'filterEditor.datetimePositions.before');
    await user.click(before!);
    await user.click(screen.getByTestId('filter-widget-panel-apply'));
    unmount();

    // Widget B: same dimension, different linked-filter guid — must NOT see widget A's draft.
    const widgetBFilter = filterFactory.members(years, [], { guid: 'widget-b-guid' });
    const { unmount: unmountB } = render(
      <ConditionFilterDate
        attribute={years}
        filter={widgetBFilter}
        today={TODAY}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    expect(screen.getByTestId('filter-widget-condition-operator')).toHaveValue(
      'filterEditor.relativeTypes.last',
    );
    unmountB();

    // Back to widget A — its own draft is still there.
    render(
      <ConditionFilterDate
        attribute={years}
        filter={widgetAFilter}
        today={TODAY}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    expect(screen.getByTestId('filter-widget-condition-operator')).toHaveValue(
      'filterEditor.datetimePositions.before',
    );
  });

  /* The dropdown hands a cleared date Condition its include-all background (not null), so the
     guid the draft was remembered under is still there when it is read back. */
  it('reopens an incomplete Before after clearing an applied condition', async () => {
    const user = userEvent.setup();
    const onFilterUpdate = vi.fn();
    const applied = filterFactory.dateRelativeTo(years, 1, 1, undefined, { guid: 'linked-guid' });
    const { rerender } = render(
      <ConditionFilterDate
        attribute={years}
        filter={applied}
        today={TODAY}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    await user.click(screen.getByTestId('filter-widget-condition-operator'));
    const before = screen
      .getAllByTestId('filter-widget-select-option')
      .find((node) => node.textContent === 'filterEditor.datetimePositions.before');
    if (!before) throw new Error('Before is not offered');
    await user.click(before);
    await user.click(screen.getByTestId('filter-widget-panel-apply'));
    expect(onFilterUpdate).toHaveBeenLastCalledWith(null);

    // The host re-renders the cleared widget as include-all of the same linked filter.
    rerender(
      <ConditionFilterDate
        attribute={years}
        filter={filterFactory.members(years, [], { guid: 'linked-guid' })}
        today={TODAY}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    expect(screen.getByTestId('filter-widget-condition-operator')).toHaveValue(
      'filterEditor.datetimePositions.before',
    );
  });

  it('keeps the linked guid when the host echoes the clear as filter={null}', async () => {
    const user = userEvent.setup();
    const onFilterUpdate = vi.fn();
    const applied = filterFactory.dateRelativeTo(years, 1, 1, undefined, { guid: 'linked-guid' });
    const { rerender } = render(
      <ConditionFilterDate
        attribute={years}
        filter={applied}
        today={TODAY}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    await user.click(screen.getByTestId('filter-widget-condition-operator'));
    const before = screen
      .getAllByTestId('filter-widget-select-option')
      .find((node) => node.textContent === 'filterEditor.datetimePositions.before');
    if (!before) throw new Error('Before is not offered');
    await user.click(before);
    await user.click(screen.getByTestId('filter-widget-panel-apply'));
    expect(onFilterUpdate).toHaveBeenLastCalledWith(null);

    // No guid anywhere now — the host stored the null it was given.
    rerender(
      <ConditionFilterDate
        attribute={years}
        filter={null}
        today={TODAY}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    expect(screen.getByTestId('filter-widget-condition-operator')).toHaveValue(
      'filterEditor.datetimePositions.before',
    );
  });

  it('publishes onto the linked guid of a blank background, without its members settings', async () => {
    const user = userEvent.setup();
    const onFilterUpdate = vi.fn();
    render(
      <ConditionFilterDate
        attribute={years}
        filter={filterFactory.members(years, [], { guid: 'linked-guid', excludeMembers: true })}
        today={TODAY}
        onFilterUpdate={onFilterUpdate}
      />,
    );

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    await user.click(screen.getByTestId('filter-widget-panel-apply'));

    const published = onFilterUpdate.mock.calls[0][0];
    expect(published.config.guid).toBe('linked-guid');
    expect(published.config).not.toHaveProperty('excludeMembers');
  });

  it('hides a grain another filter already claims from Last/This/Next', async () => {
    const user = userEvent.setup();
    const onFilterUpdate = vi.fn();
    render(
      <ConditionFilterDate
        attribute={years}
        today={TODAY}
        onFilterUpdate={onFilterUpdate}
        excludedDateLevels={[DateLevels.Months, DateLevels.Weeks]}
      />,
    );

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    await user.click(screen.getByTestId('filter-widget-condition-grain'));

    const labels = screen
      .getAllByTestId('filter-widget-select-option')
      .map((node) => node.textContent);
    expect(labels).not.toContain('filterEditor.datetimeLevels.month');
    expect(labels).not.toContain('filterEditor.datetimeLevels.week');
    expect(labels).toContain('filterEditor.datetimeLevels.year');
    expect(labels).toContain('filterEditor.datetimeLevels.quarter');
    expect(labels).toContain('filterEditor.datetimeLevels.day');
  });

  it('hides Before/After when Days is already claimed', async () => {
    const user = userEvent.setup();
    render(
      <ConditionFilterDate
        attribute={years}
        today={TODAY}
        onFilterUpdate={vi.fn()}
        excludedDateLevels={[DateLevels.Days]}
      />,
    );

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    await user.click(screen.getByTestId('filter-widget-condition-operator'));

    const labels = screen
      .getAllByTestId('filter-widget-select-option')
      .map((node) => node.textContent);
    expect(labels).toContain('filterEditor.relativeTypes.last');
    expect(labels).toContain('filterEditor.relativeTypes.this');
    expect(labels).toContain('filterEditor.relativeTypes.next');
    expect(labels).not.toContain('filterEditor.datetimePositions.before');
    expect(labels).not.toContain('filterWidget.dateCondition.onOrBefore');
    expect(labels).not.toContain('filterEditor.datetimePositions.after');
    expect(labels).not.toContain('filterWidget.dateCondition.onOrAfter');
  });

  it('defaults Last to the first free grain when Years is claimed', async () => {
    const user = userEvent.setup();
    render(
      <ConditionFilterDate
        attribute={years}
        today={TODAY}
        onFilterUpdate={vi.fn()}
        excludedDateLevels={[DateLevels.Years]}
      />,
    );

    await user.click(screen.getByTestId('filter-widget-condition-trigger'));
    expect(screen.getByTestId('filter-widget-condition-trigger')).toHaveValue(
      'filterEditor.relativeTypes.last 1 filterEditor.datetimeLevels.quarter',
    );
  });
});
