/** @vitest-environment jsdom */
import { createAttribute, type Filter, filterFactory } from '@sisense/sdk-data';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { NumberRangeFilter } from './number-range-filter.js';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en-US' } }),
  };
});

/* jsdom has no PointerEvent; a MouseEvent carries the clientX the drag reads. */
beforeAll(() => {
  if (typeof window.PointerEvent === 'undefined') {
    class PointerEventShim extends MouseEvent {
      pointerId: number;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jsdom polyfill
    (window as any).PointerEvent = PointerEventShim;
  }
});

const revenue = createAttribute({
  name: 'Revenue',
  expression: '[Commerce.Revenue]',
  type: 'numeric-attribute',
});

const setup = (overrides: Partial<Parameters<typeof NumberRangeFilter>[0]> = {}) => {
  const onFilterUpdate = vi.fn<(filter: Filter | null) => void>();
  const view = render(
    <NumberRangeFilter
      attribute={revenue}
      dataMin={100000}
      dataMax={950000}
      onFilterUpdate={onFilterUpdate}
      {...overrides}
    />,
  );
  const min = screen.getByTestId<HTMLInputElement>('filter-widget-number-range-min');
  const max = screen.getByTestId<HTMLInputElement>('filter-widget-number-range-max');
  return { onFilterUpdate, view, min, max, user: userEvent.setup() };
};

/* Reaches a handle the way a keyboard user does — Tab through the row (Minimum field, Minimum
   handle, Maximum handle, Maximum field). A click would start a drag instead. */
const tabToHandle = async (user: ReturnType<typeof userEvent.setup>, end: 'min' | 'max') => {
  const handle = screen.getByTestId(`filter-widget-number-range-${end}-handle`);
  for (let i = 0; i < 4 && document.activeElement !== handle; i += 1) await user.tab();
  expect(handle).toHaveFocus();
};

const published = (mock: ReturnType<typeof vi.fn>) =>
  (mock.mock.calls.at(-1)?.[0] as Filter | null)?.filterJaql() ?? null;

describe('NumberRangeFilter — empty state', () => {
  it('shows the column min / max as placeholders and applies nothing', () => {
    const { min, max, onFilterUpdate } = setup();
    expect(min.placeholder).toBe('100000');
    expect(max.placeholder).toBe('950000');
    expect(min.value).toBe('');
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });
});

describe('NumberRangeFilter — commit points', () => {
  it('publishes a typed value on Enter, not per keystroke', async () => {
    const { max, onFilterUpdate, user } = setup();
    await user.type(max, '500000');
    expect(onFilterUpdate).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(published(onFilterUpdate)).toEqual({ to: 500000 });
  });

  it('publishes between when both ends are set', async () => {
    const { min, max, onFilterUpdate, user } = setup();
    await user.type(min, '200000{Enter}');
    await user.type(max, '700000{Enter}');
    expect(published(onFilterUpdate)).toEqual({ from: 200000, to: 700000 });
  });

  it('reverts a field left without Enter to the applied value', async () => {
    const { min, onFilterUpdate, user } = setup({
      filter: filterFactory.greaterThanOrEqual(revenue, 200000),
    });
    expect(min.value).toBe('200000');
    await user.clear(min);
    await user.type(min, '300000');
    await user.tab();
    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(min.value).toBe('200000');
  });

  it('reads back an absent end as empty', () => {
    const { min, max } = setup({ filter: filterFactory.lessThanOrEqual(revenue, 500000) });
    expect(min.value).toBe('');
    expect(max.value).toBe('500000');
  });
});

describe('NumberRangeFilter — errors', () => {
  it('flags a non-number, publishes nothing, and keeps a refused entry after leaving', async () => {
    const { min, onFilterUpdate, user } = setup();
    await user.type(min, '12abc{Enter}');
    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.getByTestId('filter-widget-number-range-error').textContent).toBe(
      'filterEditor.validationErrors.invalidNumber',
    );
    await user.tab();
    expect(min.value).toBe('12abc');
  });

  it('keeps a refused entry when Enter and leaving the field land in one tick', async () => {
    const { min, onFilterUpdate, user } = setup();
    await user.type(min, '12abc');
    act(() => {
      fireEvent.keyDown(min, { key: 'Enter' });
      fireEvent.blur(min);
    });
    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(min.value).toBe('12abc');
  });

  it('applies a typed value outside the column data, its handle at the slider edge', async () => {
    const { max, onFilterUpdate, user } = setup();
    await user.type(max, '2000000{Enter}');
    expect(screen.queryByTestId('filter-widget-number-range-error')).toBeNull();
    expect(published(onFilterUpdate)).toEqual({ to: 2000000 });
    expect(max.value).toBe('2000000');
    expect(screen.getByTestId('filter-widget-number-range-max-handle').style.left).toBe('100%');
  });

  it('shows no error over an applied value outside the column data', async () => {
    const { max, onFilterUpdate, user } = setup({
      filter: filterFactory.greaterThanOrEqual(revenue, 50000),
    });
    expect(screen.queryByTestId('filter-widget-number-range-error')).toBeNull();
    await user.type(max, '700000{Enter}');
    expect(published(onFilterUpdate)).toEqual({ from: 50000, to: 700000 });
  });

  it('moves the other handle while the applied end is outside the column data', async () => {
    const { onFilterUpdate, user } = setup({
      filter: filterFactory.greaterThanOrEqual(revenue, 50000),
    });
    await tabToHandle(user, 'max');
    await user.keyboard('{Home}');
    expect(screen.queryByTestId('filter-widget-number-range-error')).toBeNull();
    expect(published(onFilterUpdate)).toEqual({ from: 50000, to: 100000 });
  });

  it('flags Maximum ≤ Minimum on both fields, equal included', async () => {
    const { min, max, onFilterUpdate, user } = setup({
      filter: filterFactory.greaterThanOrEqual(revenue, 500000),
    });
    await user.type(max, '500000{Enter}');
    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.getByTestId('filter-widget-number-range-error').textContent).toBe(
      'filterWidget.controls.rangeOrderError',
    );
    expect(min.getAttribute('aria-invalid')).toBe('true');
    expect(max.getAttribute('aria-invalid')).toBe('true');
  });

  it('never flags an empty field', () => {
    setup();
    expect(screen.queryByTestId('filter-widget-number-range-error')).toBeNull();
  });
});

describe('NumberRangeFilter — clear', () => {
  it('clears one end and publishes at once', async () => {
    const { onFilterUpdate, min, user } = setup({
      filter: filterFactory.between(revenue, 200000, 700000),
    });
    await user.click(screen.getByTestId('filter-widget-number-range-min-clear'));
    expect(min.value).toBe('');
    expect(published(onFilterUpdate)).toEqual({ to: 700000 });
  });

  it('clears the filter when the last end is cleared', async () => {
    const { onFilterUpdate, user } = setup({
      filter: filterFactory.greaterThanOrEqual(revenue, 200000),
    });
    await user.click(screen.getByTestId('filter-widget-number-range-min-clear'));
    expect(onFilterUpdate).toHaveBeenLastCalledWith(null);
  });
});

describe('NumberRangeFilter — slider', () => {
  it('publishes a held key once, on release', async () => {
    const { onFilterUpdate, user } = setup({
      filter: filterFactory.greaterThanOrEqual(revenue, 500000),
    });
    await tabToHandle(user, 'min');
    await user.keyboard('{ArrowRight>2}');
    expect(onFilterUpdate).not.toHaveBeenCalled();
    await user.keyboard('{/ArrowRight}');
    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(published(onFilterUpdate)).toEqual({ from: 500200 });
  });

  it('publishes each separate key press', async () => {
    const { onFilterUpdate, user } = setup({
      filter: filterFactory.greaterThanOrEqual(revenue, 500000),
    });
    await tabToHandle(user, 'min');
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(onFilterUpdate).toHaveBeenCalledTimes(2);
    expect(published(onFilterUpdate)).toEqual({ from: 499800 });
  });

  it('jumps to the data edges with Home / End', async () => {
    const { onFilterUpdate, user } = setup({
      filter: filterFactory.between(revenue, 300000, 600000),
    });
    await tabToHandle(user, 'max');
    await user.keyboard('{End}');
    expect(published(onFilterUpdate)).toEqual({ from: 300000 });
    expect(screen.getByTestId<HTMLInputElement>('filter-widget-number-range-max').value).toBe('');
  });

  it('leaves an end empty, not the edge number, when its handle reaches the data edge', async () => {
    const { onFilterUpdate, min, user } = setup({
      filter: filterFactory.greaterThanOrEqual(revenue, 100100),
    });
    await tabToHandle(user, 'min');
    await user.keyboard('{ArrowLeft}');
    expect(min.value).toBe('');
    expect(onFilterUpdate).toHaveBeenLastCalledWith(null);
  });

  it('publishes nothing for a key on an empty handle already at its edge', async () => {
    const { onFilterUpdate, user } = setup();
    await tabToHandle(user, 'min');
    await user.keyboard('{ArrowLeft}{Home}');
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });

  it('lets the handles meet but not cross, and publishes nothing for the equal pair', async () => {
    const { min, max, onFilterUpdate, user } = setup({
      filter: filterFactory.between(revenue, 300000, 600000),
    });
    await tabToHandle(user, 'min');
    await user.keyboard('{End}');
    expect(min.value).toBe('600000');
    expect(max.value).toBe('600000');
    expect(onFilterUpdate).not.toHaveBeenCalled();
    expect(screen.getByTestId('filter-widget-number-range-error').textContent).toBe(
      'filterWidget.controls.rangeOrderError',
    );
  });

  it('keeps a typed edge value as a number', async () => {
    const { min, onFilterUpdate, user } = setup();
    await user.type(min, '100000{Enter}');
    expect(published(onFilterUpdate)).toEqual({ from: 100000 });
  });

  it('publishes a drag once, on release', async () => {
    const { onFilterUpdate, user } = setup();
    const track = screen.getByTestId('filter-widget-number-range-slider')
      .firstElementChild as HTMLElement;
    track.getBoundingClientRect = () =>
      ({ left: 0, width: 850, top: 0, height: 2, right: 850, bottom: 2 } as DOMRect);
    const handle = screen.getByTestId('filter-widget-number-range-min-handle');
    await user.pointer([
      { keys: '[MouseLeft>]', target: handle, coords: { clientX: 100, clientY: 0 } },
      { target: track, coords: { clientX: 200, clientY: 0 } },
    ]);
    expect(onFilterUpdate).not.toHaveBeenCalled();
    await user.pointer({ keys: '[/MouseLeft]', target: track });
    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
    expect(published(onFilterUpdate)).toEqual({ from: 300000 });
  });

  describe('dragged to the data edge on a column whose edges are not round', () => {
    const dragTo = (end: 'min' | 'max', clientX: number, shiftKey = false) => {
      const track = screen.getByTestId('filter-widget-number-range-slider')
        .firstElementChild as HTMLElement;
      track.getBoundingClientRect = () =>
        ({ left: 0, width: 850, top: 0, height: 2, right: 850, bottom: 2 } as DOMRect);
      const handle = screen.getByTestId(`filter-widget-number-range-${end}-handle`);
      fireEvent.pointerDown(handle, { clientX: 425, pointerId: 1, shiftKey });
      fireEvent.pointerMove(track, { clientX, pointerId: 1, shiftKey });
      fireEvent.pointerUp(track, { clientX, pointerId: 1, shiftKey });
    };

    it('leaves Maximum empty, not the rounded edge, when dragged to the right end', () => {
      const { max, onFilterUpdate } = setup({
        dataMin: 123456,
        dataMax: 950123,
        filter: filterFactory.between(revenue, 200000, 500000),
      });
      dragTo('max', 900);
      expect(max.value).toBe('');
      expect(published(onFilterUpdate)).toEqual({ from: 200000 });
    });

    it('leaves Minimum empty, not the rounded edge, when dragged to the left end', () => {
      const { min, onFilterUpdate } = setup({
        dataMin: 123456,
        dataMax: 950123,
        filter: filterFactory.between(revenue, 200000, 500000),
      });
      dragTo('min', -50);
      expect(min.value).toBe('');
      expect(published(onFilterUpdate)).toEqual({ to: 500000 });
    });

    it('reaches the edge in the fine (Shift) mode too', () => {
      /* One fine pixel is a tenth of span/width ≈ 97.25; ten of them from 949151 land at
         950123.55 — just past the edge, which five-digit rounding would pull back to 950120. */
      const { max, onFilterUpdate } = setup({
        dataMin: 123456,
        dataMax: 950123,
        filter: filterFactory.between(revenue, 200000, 949151),
      });
      dragTo('max', 435, true);
      expect(max.value).toBe('');
      expect(published(onFilterUpdate)).toEqual({ from: 200000 });
    });
  });

  describe('on a column of small numbers', () => {
    const dragMinTo = (clientX: number) => {
      const track = screen.getByTestId('filter-widget-number-range-slider')
        .firstElementChild as HTMLElement;
      track.getBoundingClientRect = () =>
        ({ left: 0, width: 850, top: 0, height: 2, right: 850, bottom: 2 } as DOMRect);
      const handle = screen.getByTestId('filter-widget-number-range-min-handle');
      fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1 });
      fireEvent.pointerMove(track, { clientX, pointerId: 1 });
      fireEvent.pointerUp(track, { clientX, pointerId: 1 });
    };

    it('drags a fractional column in steps that fit its scale', () => {
      const { min, onFilterUpdate } = setup({ dataMin: 0.12, dataMax: 0.87 });
      dragMinTo(425);
      expect(min.value).toBe('0.495');
      expect(published(onFilterUpdate)).toEqual({ from: 0.495 });
    });

    it('moves a fractional handle with the keys in the same steps', async () => {
      const { onFilterUpdate, user } = setup({
        dataMin: 0.12,
        dataMax: 0.87,
        filter: filterFactory.greaterThanOrEqual(revenue, 0.5),
      });
      await tabToHandle(user, 'min');
      await user.keyboard('{ArrowRight}');
      expect(published(onFilterUpdate)).toEqual({ from: 0.501 });
    });

    it('keeps whole steps for a whole-number column', () => {
      const { onFilterUpdate } = setup({ dataMin: 1, dataMax: 5, dataCount: 5 });
      dragMinTo(300);
      expect(published(onFilterUpdate)).toEqual({ from: 2 });
    });

    it('steps in fractions between whole edges that hold fractions', () => {
      const { onFilterUpdate } = setup({ dataMin: 0, dataMax: 1, dataCount: 250 });
      dragMinTo(425);
      expect(published(onFilterUpdate)).toEqual({ from: 0.5 });
    });
  });

  it('changes nothing when a handle is only clicked, not dragged', async () => {
    const { min, onFilterUpdate, user } = setup();
    await user.type(min, '100000{Enter}');
    expect(published(onFilterUpdate)).toEqual({ from: 100000 });
    const track = screen.getByTestId('filter-widget-number-range-slider')
      .firstElementChild as HTMLElement;
    track.getBoundingClientRect = () =>
      ({ left: 0, width: 850, top: 0, height: 2, right: 850, bottom: 2 } as DOMRect);
    const handle = screen.getByTestId('filter-widget-number-range-min-handle');
    fireEvent.pointerDown(handle, { clientX: 3, pointerId: 1 });
    fireEvent.pointerUp(track, { clientX: 3, pointerId: 1 });
    expect(min.value).toBe('100000');
    expect(onFilterUpdate).toHaveBeenCalledTimes(1);
  });

  it('ignores a press on bare track', () => {
    const { onFilterUpdate } = setup();
    const track = screen.getByTestId('filter-widget-number-range-slider')
      .firstElementChild as HTMLElement;
    fireEvent.pointerDown(track, { clientX: 100, pointerId: 1 });
    fireEvent.pointerUp(track, { clientX: 100, pointerId: 1 });
    expect(onFilterUpdate).not.toHaveBeenCalled();
  });
});

describe('NumberRangeFilter — column with min = max or no data', () => {
  it('disables the slider and keeps the fields live when min = max', async () => {
    const { min, onFilterUpdate, user } = setup({ dataMin: 500, dataMax: 500 });
    expect(
      screen.getByTestId('filter-widget-number-range-min-handle').getAttribute('aria-disabled'),
    ).toBe('true');
    expect(min.placeholder).toBe('500');
    await user.type(min, '500{Enter}');
    expect(published(onFilterUpdate)).toEqual({ from: 500 });
  });

  it('keeps the handles out of sight until the column bounds arrive, then shows them in place', () => {
    const filter = filterFactory.between(revenue, 300000, 600000);
    const { view, onFilterUpdate } = setup({ dataMin: undefined, dataMax: undefined, filter });
    const handle = () => screen.getByTestId('filter-widget-number-range-max-handle');
    expect(handle().style.visibility).toBe('hidden');
    view.rerender(
      <NumberRangeFilter
        attribute={revenue}
        filter={filter}
        dataMin={100000}
        dataMax={950000}
        onFilterUpdate={onFilterUpdate}
      />,
    );
    expect(handle().style.visibility).toBe('');
    expect(handle().style.left).toBe(`${((600000 - 100000) / 850000) * 100}%`);
  });

  it('shows no placeholders without data, and the fields stay live', async () => {
    const { min, onFilterUpdate, user } = setup({ dataMin: undefined, dataMax: undefined });
    expect(min.placeholder).toBe('');
    expect(
      screen.getByTestId('filter-widget-number-range-min-handle').getAttribute('aria-disabled'),
    ).toBe('true');
    await user.type(min, '42{Enter}');
    expect(published(onFilterUpdate)).toEqual({ from: 42 });
  });
});

describe('NumberRangeFilter — layout', () => {
  const withWidth = (width: number) =>
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width,
      height: 28,
      top: 0,
      left: 0,
      right: width,
      bottom: 28,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

  it('keeps one line at the stacking width and above', () => {
    const spy = withWidth(384);
    setup({ stackBelow: 384 });
    expect(screen.getByTestId('filter-widget-number-range').hasAttribute('data-stacked')).toBe(
      false,
    );
    spy.mockRestore();
  });

  it('stacks below the stacking width', () => {
    const spy = withWidth(383);
    setup({ stackBelow: 384 });
    expect(screen.getByTestId('filter-widget-number-range').getAttribute('data-stacked')).toBe(
      'true',
    );
    spy.mockRestore();
  });
});

describe('NumberRangeFilter — slider track vs Border style', () => {
  const root = () => screen.getByTestId('filter-widget-number-range');
  const trackVar = () => root().style.getPropertyValue('--csdk-fw-number-range-slider-track');
  const borderVar = () => root().style.getPropertyValue('--csdk-fw-border');

  it('derives the track from Primary Text, not from Border, when Border is switched off', () => {
    setup({ controlStyle: { primaryText: '#131f29', borderEnabled: false } });
    expect(borderVar()).toBe('transparent');
    expect(trackVar()).not.toBe('transparent');
    expect(trackVar().toLowerCase()).toContain('131f29');
  });

  it('does not take a custom Border colour onto the track', () => {
    setup({ controlStyle: { primaryText: '#131f29', borderColor: '#ff0000' } });
    expect(borderVar().toLowerCase()).toBe('#ff0000');
    expect(trackVar().toLowerCase()).not.toContain('ff0000');
    expect(trackVar().toLowerCase()).toContain('131f29');
  });

  it('follows Primary Text when it is overridden', () => {
    setup({ controlStyle: { primaryText: '#abcdef' } });
    expect(trackVar().toLowerCase()).toContain('abcdef');
  });
});

describe('NumberRangeFilter — the host echoing a commit back', () => {
  const renderWith = (
    view: ReturnType<typeof render>,
    onFilterUpdate: (filter: Filter | null) => void,
    filter: Filter | null,
  ) =>
    view.rerender(
      <NumberRangeFilter
        attribute={revenue}
        dataMin={100000}
        dataMax={950000}
        onFilterUpdate={onFilterUpdate}
        filter={filter}
      />,
    );

  it('keeps the committed pair on screen through an interim empty or previous filter', async () => {
    const before = filterFactory.greaterThanOrEqual(revenue, 200000);
    const { view, min, max, onFilterUpdate, user } = setup({ filter: before });
    await user.type(max, '500000{Enter}');
    const published = onFilterUpdate.mock.calls.at(-1)?.[0] ?? null;

    renderWith(view, onFilterUpdate, null);
    expect(max.value).toBe('500000');
    expect(min.value).toBe('200000');

    renderWith(view, onFilterUpdate, before);
    expect(max.value).toBe('500000');

    renderWith(view, onFilterUpdate, published);
    expect(min.value).toBe('200000');
    expect(max.value).toBe('500000');
  });

  describe('when no echo comes back', () => {
    const commitMax = (max: HTMLInputElement, text: string) => {
      fireEvent.change(max, { target: { value: text } });
      fireEvent.keyDown(max, { key: 'Enter' });
    };

    it('takes a filter the host reverted to for good, after the wait', () => {
      vi.useFakeTimers();
      try {
        const before = filterFactory.greaterThanOrEqual(revenue, 200000);
        const { view, max, onFilterUpdate } = setup({ filter: before });
        commitMax(max, '500000');
        renderWith(view, onFilterUpdate, before);
        expect(max.value).toBe('500000');
        act(() => vi.advanceTimersByTime(1000));
        expect(max.value).toBe('');
      } finally {
        vi.useRealTimers();
      }
    });

    it('takes a clear the host made after the commit, after the wait', () => {
      vi.useFakeTimers();
      try {
        const { view, min, max, onFilterUpdate } = setup({
          filter: filterFactory.greaterThanOrEqual(revenue, 200000),
        });
        commitMax(max, '500000');
        renderWith(view, onFilterUpdate, null);
        act(() => vi.advanceTimersByTime(1000));
        expect(min.value).toBe('');
        expect(max.value).toBe('');
      } finally {
        vi.useRealTimers();
      }
    });

    it('keeps the commit when its echo follows an interim filter inside the wait', () => {
      vi.useFakeTimers();
      try {
        const { view, min, max, onFilterUpdate } = setup({
          filter: filterFactory.greaterThanOrEqual(revenue, 200000),
        });
        commitMax(max, '500000');
        const echo = onFilterUpdate.mock.calls.at(-1)?.[0] ?? null;
        renderWith(view, onFilterUpdate, null);
        act(() => vi.advanceTimersByTime(300));
        renderWith(view, onFilterUpdate, echo);
        act(() => vi.advanceTimersByTime(2000));
        expect(min.value).toBe('200000');
        expect(max.value).toBe('500000');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  it('still takes a filter changed from outside once the commit has landed', async () => {
    const { view, min, max, onFilterUpdate, user } = setup({
      filter: filterFactory.greaterThanOrEqual(revenue, 200000),
    });
    await user.type(max, '500000{Enter}');
    renderWith(view, onFilterUpdate, onFilterUpdate.mock.calls.at(-1)?.[0] ?? null);
    renderWith(view, onFilterUpdate, null);
    expect(min.value).toBe('');
    expect(max.value).toBe('');
  });

  it('takes a different filter from outside even while a commit is on its way', async () => {
    const { view, min, max, onFilterUpdate, user } = setup({
      filter: filterFactory.greaterThanOrEqual(revenue, 200000),
    });
    await user.type(max, '500000{Enter}');
    renderWith(view, onFilterUpdate, filterFactory.lessThanOrEqual(revenue, 300000));
    expect(min.value).toBe('');
    expect(max.value).toBe('300000');
  });
});
