/** @vitest-environment jsdom */
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_DATE_MASK } from '../components/date-text.js';
import type { RelativeSpec } from './time-frame-catalogue';
import { DEFAULT_TIME_FRAME_KEYS, readTimeFramesInput, specKey } from './time-frame-catalogue';
import { TimeFrameFilter } from './time-frame-filter';

/**
 * Minimal i18n stub — echoes the key so assertions can match on it, but resolves the
 * pluralised keys we care about with count-aware suffixes so `Last 7 days` reads back
 * as a real label rather than the raw key.
 */
vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: { count?: number }) => {
        if (options && typeof options === 'object' && typeof options.count === 'number') {
          // Return `${key}(count=N)` so tests can assert on the concrete count.
          return `${key}(${options.count})`;
        }
        return key;
      },
      i18n: { language: 'en-US' },
    }),
  };
});

vi.mock('../components/use-date-mask', () => ({
  useDateMask: () => ({ mask: DEFAULT_DATE_MASK, locale: 'en-US' }),
}));

const DEFAULT_OFFERED: RelativeSpec[] = readTimeFramesInput(undefined) as RelativeSpec[];
const TODAY = new Date(2026, 8, 21);

const setup = (props: Partial<React.ComponentProps<typeof TimeFrameFilter>> = {}) => {
  const onPick = vi.fn();
  const result = render(
    <TimeFrameFilter
      offered={DEFAULT_OFFERED}
      selectedKey={undefined}
      onPick={onPick}
      today={TODAY}
      {...props}
    />,
  );
  return { onPick, ...result };
};

describe('TimeFrameFilter — closed trigger', () => {
  it('reads the placeholder when nothing is selected', () => {
    setup();
    // The trigger is a Selector input; its value is empty and placeholder is the shared key.
    const trigger = screen.getByTestId('filter-widget-time-frame-trigger');
    expect(trigger).toHaveValue('');
    expect(trigger).toHaveAttribute('placeholder', 'filterWidget.placeholders.setFilter');
  });

  it('reads the selected frame label when a valid selectedKey is passed', () => {
    setup({ selectedKey: 'this:1:Month' });
    const trigger: HTMLInputElement = screen.getByTestId('filter-widget-time-frame-trigger');
    expect(trigger.value).toBe('filterWidget.timeFrame.labels.this.month');
  });

  it('treats an unknown / withdrawn selectedKey as nothing-selected', () => {
    setup({ selectedKey: 'last:99:Decade' });
    const trigger: HTMLInputElement = screen.getByTestId('filter-widget-time-frame-trigger');
    expect(trigger.value).toBe('');
  });
});

describe('TimeFrameFilter — panel', () => {
  it('renders all offered rows in catalogue order when opened', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByTestId('filter-widget-time-frame-trigger'));

    const panel = screen.getByTestId('filter-widget-time-frame-panel');
    // Rows carry data-time-frame-key attributes matching the offered set, in order.
    const rowKeys = within(panel)
      .getAllByRole('option')
      .map((row) => row.getAttribute('data-time-frame-key'));
    expect(rowKeys).toEqual([...DEFAULT_TIME_FRAME_KEYS]);
  });

  it('picking a row calls onPick with the frame and closes the panel', async () => {
    const user = userEvent.setup();
    const { onPick } = setup();
    await user.click(screen.getByTestId('filter-widget-time-frame-trigger'));

    const monthRow = screen.getByTestId('filter-widget-time-frame-row-this:1:Month');
    await user.click(monthRow);

    expect(onPick).toHaveBeenCalledTimes(1);
    expect(specKey(onPick.mock.calls[0][0] as RelativeSpec)).toBe('this:1:Month');
    expect(screen.queryByTestId('filter-widget-time-frame-panel')).toBeNull();
  });

  it('clicking the already-selected row is a no-op — no republish, panel still closes', async () => {
    const user = userEvent.setup();
    const { onPick } = setup({ selectedKey: 'this:1:Month' });
    await user.click(screen.getByTestId('filter-widget-time-frame-trigger'));

    await user.click(screen.getByTestId('filter-widget-time-frame-row-this:1:Month'));

    expect(onPick).not.toHaveBeenCalled();
    expect(screen.queryByTestId('filter-widget-time-frame-panel')).toBeNull();
  });

  it('sets aria-selected on the chosen row only, never on merely hovered ones', async () => {
    const user = userEvent.setup();
    setup({ selectedKey: 'this:1:Month' });
    await user.click(screen.getByTestId('filter-widget-time-frame-trigger'));

    const selectedRow = screen.getByTestId('filter-widget-time-frame-row-this:1:Month');
    expect(selectedRow).toHaveAttribute('aria-selected', 'true');

    const otherRow = screen.getByTestId('filter-widget-time-frame-row-this:1:Year');
    expect(otherRow).toHaveAttribute('aria-selected', 'false');

    await user.hover(otherRow);
    // Hovering must not flip aria-selected — the preview bar is where the hover shows up.
    expect(otherRow).toHaveAttribute('aria-selected', 'false');
  });
});

describe('TimeFrameFilter — preview bar', () => {
  it('at rest with no selection and no data span shows the placeholder text, `empty` state', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByTestId('filter-widget-time-frame-trigger'));

    const preview = screen.getByTestId('filter-widget-time-frame-preview');
    expect(preview.textContent).toBe('filterWidget.placeholders.setFilter');
    expect(preview).toHaveAttribute('data-state', 'empty');
  });

  it('at rest with min/max shows the dimension span, `data-span` state', async () => {
    const user = userEvent.setup();
    setup({
      earliestData: new Date(2020, 0, 1),
      latestData: new Date(2026, 11, 31),
    });
    await user.click(screen.getByTestId('filter-widget-time-frame-trigger'));

    const preview = screen.getByTestId('filter-widget-time-frame-preview');
    // Intl format; exact text depends on the runtime but must include both years.
    expect(preview.textContent).toMatch(/2020/);
    expect(preview.textContent).toMatch(/2026/);
    expect(preview).toHaveAttribute('data-state', 'data-span');
  });

  it("at rest with a selection shows the selected frame's range, `selected` state", async () => {
    const user = userEvent.setup();
    setup({ selectedKey: 'this:1:Month' });
    await user.click(screen.getByTestId('filter-widget-time-frame-trigger'));

    const preview = screen.getByTestId('filter-widget-time-frame-preview');
    // This month, today = 2026-09-21 → Sep 1 – Sep 30 → both endpoints share 2026 and Sep.
    expect(preview.textContent).toContain('2026');
    expect(preview).toHaveAttribute('data-state', 'selected');
  });

  it("hovering a row shows THAT row's range in primary ink, `hovered` state", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByTestId('filter-widget-time-frame-trigger'));

    await user.hover(screen.getByTestId('filter-widget-time-frame-row-this:1:Year'));

    const preview = screen.getByTestId('filter-widget-time-frame-preview');
    // This year → Jan 1 – Dec 31, 2026 — both endpoints share 2026.
    expect(preview.textContent).toMatch(/2026/);
    expect(preview).toHaveAttribute('data-state', 'hovered');
  });
});

describe('TimeFrameFilter — e2e locator hooks', () => {
  it('the row list carries `filter-widget-time-frame-list`, holding one row per offered frame', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByTestId('filter-widget-time-frame-trigger'));

    const list = screen.getByTestId('filter-widget-time-frame-list');
    // 11 default frames — one row each.
    expect(within(list).getAllByRole('option')).toHaveLength(DEFAULT_TIME_FRAME_KEYS.length);
  });

  it('the selected row publishes `data-selected="true"`, others `false`', async () => {
    const user = userEvent.setup();
    setup({ selectedKey: 'this:1:Month' });
    await user.click(screen.getByTestId('filter-widget-time-frame-trigger'));

    const selectedRow = screen.getByTestId('filter-widget-time-frame-row-this:1:Month');
    const otherRow = screen.getByTestId('filter-widget-time-frame-row-this:1:Year');
    expect(selectedRow).toHaveAttribute('data-selected', 'true');
    expect(otherRow).toHaveAttribute('data-selected', 'false');
  });
});

describe('TimeFrameFilter — clear', () => {
  it("the trigger's clear button calls onPick(null)", () => {
    const { onPick } = setup({ selectedKey: 'this:1:Month' });

    // Selector renders its ✕ only on hover/focus (see selector.tsx `showClear`) — mimic
    // hover via a fireEvent so the state settles synchronously, then click the ✕. userEvent
    // for both was flaky because the pointer transfer between elements re-emits mouseleave
    // in a way that unmounts the button between hover-in and the click firing.
    const trigger = screen.getByTestId('filter-widget-time-frame-trigger');
    fireEvent.mouseEnter(trigger);

    const clearButton = screen.getByTestId('filter-widget-select-clear');
    fireEvent.click(clearButton);

    expect(onPick).toHaveBeenCalledWith(null);
  });
});
