import { useState } from 'react';

import { render } from '@testing-library/react';

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

const renderedIds = (row: HTMLElement) =>
  Array.from(row.querySelectorAll('[data-header-item-id]')).map((el) =>
    el.getAttribute('data-header-item-id'),
  );

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
