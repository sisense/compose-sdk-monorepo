import { useState } from 'react';

import { render, within } from '@testing-library/react';

import { createHeaderSpacerItem, HeaderItem } from '@/domains/shared/header';

import { DashboardHeaderConfig } from './dashboard-header-config.js';
import { DashboardHeaderTargets } from './dashboard-header-targets.js';
import { createDashboardTitleItem } from './dashboard-header-title.js';
import { DashboardHeader } from './dashboard-header.js';

const TEST_TITLE = 'Test Title';

/** The built-in skeleton assembled by the container: title + center spacer. */
const builtIns = (): HeaderItem[] => [
  createDashboardTitleItem(TEST_TITLE),
  createHeaderSpacerItem(DashboardHeaderTargets.Spacer),
];

/** Item cells expose `data-testid="header-item-<item id>"`. */
const CELL_TESTID_PREFIX = 'header-item-';

const renderedIds = (row: HTMLElement) =>
  Array.from(row.querySelectorAll(`[data-testid^="${CELL_TESTID_PREFIX}"]`)).map((el) =>
    (el.getAttribute('data-testid') ?? '').slice(CELL_TESTID_PREFIX.length),
  );

const cellOf = (row: HTMLElement, id: string): HTMLElement =>
  within(row).getByTestId(`${CELL_TESTID_PREFIX}${id}`);

const documentStyleText = () =>
  Array.from(document.querySelectorAll('style'))
    .map((styleEl) => styleEl.textContent ?? '')
    .join('');

/** The emotion class whose rule collapses empty cells (`.<class>:empty { display: none }`). */
const collapsibleCellClass = (): string => {
  const match = documentStyleText().match(/\.([A-Za-z0-9_-]+):empty[^{]*\{[^}]*display:\s*none/);
  return match?.[1] ?? '';
};

/** Concatenates the CSS rule blocks of the element's own emotion classes. */
const ownRuleBlocks = (element: HTMLElement): string => {
  const styleText = documentStyleText();
  return element.className
    .split(/\s+/)
    .filter(Boolean)
    .map((className) => {
      const ruleStart = styleText.indexOf(`.${className}{`);
      if (ruleStart === -1) return '';
      return styleText.slice(ruleStart, styleText.indexOf('}', ruleStart));
    })
    .join(';');
};

describe('DashboardHeader', () => {
  it('renders the title as a header item', () => {
    const { getByText, getByTestId } = render(<DashboardHeader items={builtIns()} />);

    expect(getByText(TEST_TITLE)).toBeInTheDocument();
    expect(getByTestId('dashboard-header-title')).toHaveTextContent(TEST_TITLE);
  });

  it('places auto items after the center spacer and before the menu', () => {
    const items: HeaderItem[] = [
      ...builtIns(),
      { id: DashboardHeaderTargets.Menu, component: () => <span data-testid="menu">menu</span> },
    ];
    const config: DashboardHeaderConfig = {
      items: [{ id: 'user', component: () => <span data-testid="user">user</span> }],
    };

    const { getByTestId } = render(<DashboardHeader items={items} config={config} />);

    expect(getByTestId('user')).toBeInTheDocument();
    expect(renderedIds(getByTestId('header-items-row'))).toEqual([
      DashboardHeaderTargets.Title,
      DashboardHeaderTargets.Spacer,
      'user',
      DashboardHeaderTargets.Menu,
    ]);
  });

  it('allows injecting an item before (left of) the title via position "first"', () => {
    const config: DashboardHeaderConfig = {
      items: [
        {
          id: 'left',
          position: { type: 'first' },
          component: () => <span data-testid="left">L</span>,
        },
      ],
    };

    const { getByTestId } = render(<DashboardHeader items={builtIns()} config={config} />);

    expect(getByTestId('left')).toBeInTheDocument();
    expect(renderedIds(getByTestId('header-items-row'))).toEqual([
      'left',
      DashboardHeaderTargets.Title,
      DashboardHeaderTargets.Spacer,
    ]);
  });

  it('allows injecting an item before the title via position "before: Title"', () => {
    const config: DashboardHeaderConfig = {
      items: [
        {
          id: 'left',
          position: { type: 'before', target: DashboardHeaderTargets.Title },
          component: () => <span data-testid="left">L</span>,
        },
      ],
    };

    const { getByTestId } = render(<DashboardHeader items={builtIns()} config={config} />);

    expect(renderedIds(getByTestId('header-items-row'))).toEqual([
      'left',
      DashboardHeaderTargets.Title,
      DashboardHeaderTargets.Spacer,
    ]);
  });

  it('renders an item component that uses hooks (isolated to its own fiber)', () => {
    const HookItem = () => {
      const [count, setCount] = useState(0);
      return (
        <button data-testid="hook-item" onClick={() => setCount((c) => c + 1)}>
          {count}
        </button>
      );
    };
    const config: DashboardHeaderConfig = {
      items: [{ id: 'hooked', component: HookItem }],
    };

    const { getByTestId } = render(<DashboardHeader items={builtIns()} config={config} />);

    expect(getByTestId('hook-item')).toHaveTextContent('0');
  });

  it('positions a custom item relative to a hidden built-in anchor without rendering the anchor', () => {
    // The filter toggle is present but hidden (e.g. the filter icon is disabled in config). It
    // should still anchor `before`/`after`, while never rendering itself.
    const items: HeaderItem[] = [
      ...builtIns(),
      {
        id: DashboardHeaderTargets.FilterToggle,
        hidden: true,
        component: () => <span data-testid="filter">filter</span>,
      },
      { id: DashboardHeaderTargets.Menu, component: () => <span data-testid="menu">menu</span> },
    ];
    const config: DashboardHeaderConfig = {
      items: [
        {
          id: 'custom',
          position: { type: 'before', target: DashboardHeaderTargets.FilterToggle },
          component: () => <span data-testid="custom">custom</span>,
        },
      ],
    };

    const { getByTestId, queryByTestId } = render(
      <DashboardHeader items={items} config={config} />,
    );

    expect(getByTestId('custom')).toBeInTheDocument();
    expect(queryByTestId('filter')).not.toBeInTheDocument();
    expect(renderedIds(getByTestId('header-items-row'))).toEqual([
      DashboardHeaderTargets.Title,
      DashboardHeaderTargets.Spacer,
      'custom',
      DashboardHeaderTargets.Menu,
    ]);
  });

  it('sizes each item cell to the dashboard default height (28px) and centers it vertically', () => {
    const { getByTestId } = render(<DashboardHeader items={builtIns()} />);
    const row = getByTestId('header-items-row');

    const titleCell = cellOf(row, DashboardHeaderTargets.Title);
    expect(titleCell.style.height).toBe('28px');
    expect(titleCell.style.alignItems).toBe('center');
  });

  it('grows an item cell to a taller custom item height so the header can grow vertically', () => {
    const config: DashboardHeaderConfig = {
      items: [{ id: 'tall', size: { height: 44 }, component: () => <span>tall</span> }],
    };

    const { getByTestId } = render(<DashboardHeader items={builtIns()} config={config} />);
    const tallCell = cellOf(getByTestId('header-items-row'), 'tall');

    expect(tallCell.style.height).toBe('44px');
  });

  it('centers an external fixed-width item within its box', () => {
    const config: DashboardHeaderConfig = {
      items: [{ id: 'wide', size: { width: 120 }, component: () => <span>wide</span> }],
    };

    const { getByTestId } = render(<DashboardHeader items={builtIns()} config={config} />);
    const wideCell = cellOf(getByTestId('header-items-row'), 'wide');

    expect(wideCell.style.width).toBe('120px');
    expect(wideCell.style.justifyContent).toBe('center');
  });

  it('renders a 10px gap between header items', () => {
    const { getByTestId } = render(<DashboardHeader items={builtIns()} />);
    const row = getByTestId('header-items-row');

    // jsdom can't resolve an Emotion-injected `gap` via getComputedStyle, so the row's gap is
    // asserted against the inserted CSS rule blocks of the row's own classes — scoped so an
    // unrelated Emotion/MUI rule can't satisfy it.
    expect(ownRuleBlocks(row)).toMatch(/gap:\s*10px/);
  });

  it('grows with its content: min-height, no fixed height, and no flex squeeze', () => {
    const { getByTestId } = render(<DashboardHeader items={builtIns()} />);
    const containerRule = ownRuleBlocks(getByTestId('dashboard-header'));

    expect(containerRule).toMatch(/min-height:\s*48px/);
    // A height-constrained flex column must not squeeze the header back to its min-height.
    expect(containerRule).toMatch(/flex-shrink:\s*0/);
    // No fixed height — the header grows with its tallest item (paddings stay fixed).
    expect(containerRule).not.toMatch(/[;{]height:/);
  });

  it('scrolls horizontally (and only horizontally) instead of clipping overflowing items', () => {
    const { getByTestId } = render(<DashboardHeader items={builtIns()} />);
    const rowRule = ownRuleBlocks(getByTestId('header-items-row'));

    expect(rowRule).toMatch(/overflow-x:\s*auto/);
    // Never a vertical scrollbar — the cells define the row height.
    expect(rowRule).toMatch(/overflow-y:\s*hidden/);
  });

  it('keeps the intentionally-empty center spacer growable (exempt from empty-cell collapse)', () => {
    const { getByTestId } = render(<DashboardHeader items={builtIns()} />);
    const spacer = cellOf(getByTestId('header-items-row'), DashboardHeaderTargets.Spacer);

    expect(spacer).toBeEmptyDOMElement();
    // The spacer opts out of the collapse rule, so it keeps absorbing the free space.
    expect(spacer.classList.contains(collapsibleCellClass())).toBe(false);
    expect(spacer.style.flex).toBe('1 1 auto');
  });

  it('ignores a custom item that reuses a built-in target id and logs a console.error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const config: DashboardHeaderConfig = {
        items: [{ id: DashboardHeaderTargets.Title, component: () => <span>oops</span> }],
      };

      render(<DashboardHeader items={builtIns()} config={config} />);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining(DashboardHeaderTargets.Title));
    } finally {
      errorSpy.mockRestore();
    }
  });
});
