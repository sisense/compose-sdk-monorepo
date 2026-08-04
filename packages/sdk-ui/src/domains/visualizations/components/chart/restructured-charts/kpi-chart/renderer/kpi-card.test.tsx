/** @vitest-environment jsdom */
import { createRef } from 'react';

import { render } from '@testing-library/react';

import { KpiCard } from './kpi-card.js';

/** Reads `element.parentElement`, failing loudly (not with a silent `null`) if it has none. */
function requireParent(element: HTMLElement): HTMLElement {
  const parent = element.parentElement;
  if (!parent) {
    throw new Error('Expected element to have a parent');
  }
  return parent;
}

const baseCard = {
  tier: 'lg' as const,
  ariaLabel: 'label',
  card: { textAlign: 'left' as const, showBorder: false, cornerRadius: 8 },
  clickable: false,
  title: <div data-testid="title">title</div>,
  value: <div data-testid="value">value</div>,
  comparison: <div data-testid="comparison">comparison</div>,
  sparkline: <div data-testid="sparkline">sparkline</div>,
};

describe('KpiCard', () => {
  it('groups value and comparison inside a single BodyArea, both DOM-ordered value-then-comparison, in the standard layout', () => {
    const { getByTestId } = render(<KpiCard {...baseCard} layout="standard" />);
    const valueSlot = requireParent(getByTestId('value'));
    const comparisonSlot = requireParent(getByTestId('comparison'));

    // Same BodyArea parent -- grouped, not distributed across separate grid cells.
    expect(valueSlot.parentElement).toBe(comparisonSlot.parentElement);
    expect(getComputedStyle(valueSlot).order).toBe('0');
    expect(getComputedStyle(comparisonSlot).order).toBe('1');
  });

  it('swaps the visual order (comparison first) via CSS order in the comparison-first layout, without touching DOM order', () => {
    const { getByTestId, container } = render(<KpiCard {...baseCard} layout="comparison-first" />);
    const valueSlot = requireParent(getByTestId('value'));
    const comparisonSlot = requireParent(getByTestId('comparison'));

    expect(getComputedStyle(valueSlot).order).toBe('1');
    expect(getComputedStyle(comparisonSlot).order).toBe('0');

    // DOM (source) order is unaffected by the layout -- value still precedes comparison in the
    // markup, matching 'standard' -- only the CSS order differs.
    const testIds = Array.from(container.querySelectorAll('[data-testid]')).map((el) =>
      el.getAttribute('data-testid'),
    );
    expect(testIds).toEqual(['title', 'value', 'comparison', 'sparkline']);
  });

  it('omits the comparison BodySlot entirely when no comparison is provided', () => {
    const { queryByTestId, getByTestId } = render(
      <KpiCard {...baseCard} layout="standard" comparison={undefined} />,
    );
    expect(queryByTestId('comparison')).toBeNull();
    expect(getByTestId('value')).toBeTruthy();
  });

  it('flexes the sparkline row (min 32px) when a sparkline is rendered, the body row otherwise', () => {
    // UAT round 2 Issue 4: with a sparkline, the sparkline row absorbs the leftover height on
    // tall cards; without one, the body row flexes and the leftover reads as space below the
    // content group (the original behavior).
    const { getByRole, rerender } = render(<KpiCard {...baseCard} layout="standard" />);
    expect(getComputedStyle(getByRole('figure')).gridTemplateRows).toBe(
      'auto auto minmax(32px, 1fr)',
    );

    rerender(<KpiCard {...baseCard} layout="standard" sparkline={undefined} />);
    expect(getComputedStyle(getByRole('figure')).gridTemplateRows).toBe('auto 1fr auto');
  });

  it('forwards bodyRef to BodyArea so the orchestrator can measure its grid-derived height', () => {
    const bodyRef = createRef<HTMLDivElement>();
    const { getByTestId } = render(<KpiCard {...baseCard} layout="standard" bodyRef={bodyRef} />);
    expect(bodyRef.current).not.toBeNull();
    expect(bodyRef.current).toBe(requireParent(requireParent(getByTestId('value'))));
    // The height-budget measurement target is identifiable in the DOM like every other card
    // area (title/value/comparison/sparkline) -- browser harnesses and tests rely on this.
    expect(bodyRef.current).toHaveAttribute('data-kpi-area', 'body');
  });

  describe('textAlign', () => {
    it.each([
      ['left', 'start'],
      ['center', 'center'],
      ['right', 'end'],
    ] as const)(
      "maps card.textAlign '%s' to the logical text-align value '%s' (RTL-safe -- never 'left'/'right')",
      (textAlign, expected) => {
        const { getByRole } = render(
          <KpiCard {...baseCard} layout="standard" card={{ ...baseCard.card, textAlign }} />,
        );
        expect(getComputedStyle(getByRole('figure')).textAlign).toBe(expected);
      },
    );
  });
});
