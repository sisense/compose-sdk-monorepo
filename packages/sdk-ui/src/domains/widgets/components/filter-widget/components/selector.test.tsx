import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Selector } from './selector';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return { ...actual, useTranslation: () => ({ t: (key: string) => key }) };
});

const YEARS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];

// Every character is 10px wide, so a width in pixels reads as a character count × 10.
const CHAR_WIDTH = 10;

/* The width the value has with nothing optional beside it. `2019, 2020, 2021, 2022, 2023 +2`
   is 31 characters and fits exactly; adding 2024 would not. */
const VALUE_WIDTH = 310;

// What the ✕ takes when it mounts — the icon slot, as the field's own styles size it.
const CLEAR_SLOT = 24;

// Lets the test drive the resize the ✕ causes, which jsdom does not lay out for itself.
let notifyResize: (() => void) | undefined;

const isClearMounted = () =>
  document.querySelector('[data-testid="filter-widget-select-clear"]') !== null;

/**
 * Returns the hover target for the Selector field (Field wraps the combobox).
 * @returns The Field element that owns the combobox's hover handlers.
 */
const getSelectorHoverTarget = (): HTMLElement => {
  const parent = screen.getByRole('combobox').parentElement;
  if (!parent) {
    throw new Error('Expected combobox to have a parentElement');
  }
  return parent;
};

beforeEach(() => {
  notifyResize = undefined;

  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        notifyResize = () => callback([], this);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  /* Stands in for flex layout: the value gives up the ✕'s slot the moment it mounts. */
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(() =>
    isClearMounted() ? VALUE_WIDTH - CLEAR_SLOT : VALUE_WIDTH,
  );

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    font: '',
    measureText: (text: string) => ({ width: text.length * CHAR_WIDTH }),
  } as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Selector', () => {
  it('names as many values as the box fits and counts the rest', () => {
    render(<Selector names={YEARS} />);

    expect(screen.getByRole('combobox')).toHaveValue('2019, 2020, 2021, 2022, 2023');
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  /* The ✕ appears on hover and takes its slot out of the value. Left to feed back into the
     measurement it dropped a name and bumped the count, so one selection read `+2` with the
     pointer away and `+3` with it over the box. The last name is clipped instead. */
  it('keeps the count the same when hover mounts the clear action', async () => {
    const user = userEvent.setup();
    render(<Selector names={YEARS} />);
    const box = getSelectorHoverTarget();

    await user.hover(box);
    // The observer reports the narrower value, exactly as it does in a browser.
    act(() => notifyResize?.());

    expect(screen.getByTestId('filter-widget-select-clear')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('2019, 2020, 2021, 2022, 2023');
  });

  it('names every value on hover, including the ones the box had no room for', async () => {
    const user = userEvent.setup();
    render(<Selector names={YEARS} />);
    const box = getSelectorHoverTarget();

    expect(screen.queryByTestId('filter-widget-select-tooltip')).not.toBeInTheDocument();

    await user.hover(box);

    expect(screen.getByTestId('filter-widget-select-tooltip')).toHaveTextContent(YEARS.join(', '));
  });

  it('says nothing extra on hover when the box already names the whole selection', async () => {
    const user = userEvent.setup();
    render(<Selector names={['2019', '2020']} />);
    const box = getSelectorHoverTarget();

    await user.hover(box);

    expect(screen.queryByTestId('filter-widget-select-tooltip')).not.toBeInTheDocument();
  });

  /* The list, not a hover hint, is what an open trigger owes its reader. */
  it('withholds the hover names while the list is open', async () => {
    const user = userEvent.setup();
    render(<Selector names={YEARS} open onOpenChange={vi.fn()} popover={<div />} />);
    const box = getSelectorHoverTarget();

    await user.hover(box);

    expect(screen.queryByTestId('filter-widget-select-tooltip')).not.toBeInTheDocument();
  });

  it('names an overflowing closed value on hover', async () => {
    const user = userEvent.setup();
    const longValue = 'Contains a-very-long-condition-value-that-cannot-fit';
    render(<Selector value={longValue} />);
    const box = getSelectorHoverTarget();

    expect(screen.queryByTestId('filter-widget-select-tooltip')).not.toBeInTheDocument();

    await user.hover(box);

    expect(screen.getByTestId('filter-widget-select-tooltip')).toHaveTextContent(longValue);
  });

  it('says nothing extra on hover when a closed value already fits', async () => {
    const user = userEvent.setup();
    render(<Selector value="empty" />);
    const box = getSelectorHoverTarget();

    await user.hover(box);

    expect(screen.queryByTestId('filter-widget-select-tooltip')).not.toBeInTheDocument();
  });

  it('shows a caller tooltip on hover while closed', async () => {
    const user = userEvent.setup();
    render(
      <Selector
        value="Contains cardio AND Ends with ology"
        tooltip={
          <>
            <span>Contains cardio</span>
            <span>AND Ends with ology</span>
          </>
        }
      />,
    );
    const box = getSelectorHoverTarget();

    await user.hover(box);

    const tip = screen.getByTestId('filter-widget-select-tooltip');
    expect(tip).toHaveTextContent('Contains cardio');
    expect(tip).toHaveTextContent('AND Ends with ology');
  });

  it('withholds a caller tooltip when the closed value already fits', async () => {
    const user = userEvent.setup();
    render(
      <Selector
        value="Contains a AND Contains b"
        tooltip={
          <>
            <span>Contains a</span>
            <span>AND Contains b</span>
          </>
        }
      />,
    );
    const box = getSelectorHoverTarget();

    await user.hover(box);

    expect(screen.queryByTestId('filter-widget-select-tooltip')).not.toBeInTheDocument();
  });

  it('withholds a caller tooltip while the panel is open', async () => {
    const user = userEvent.setup();
    render(
      <Selector
        value="Contains cardio AND Ends with ology"
        tooltip={<span>Contains cardio</span>}
        open
        onOpenChange={vi.fn()}
        popover={<div />}
      />,
    );
    const box = getSelectorHoverTarget();

    await user.hover(box);

    expect(screen.queryByTestId('filter-widget-select-tooltip')).not.toBeInTheDocument();
  });
});
