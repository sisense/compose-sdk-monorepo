/** @vitest-environment jsdom */
// Integration test of the filter tile menu: config → menu items hook → menu button → open popover.
// The unit tests around `useFilterTileMenuItems` cover which items are produced; this covers that a
// consumer-supplied item actually reaches the rendered menu and that clicking it runs the handler,
// which no other test asserts end to end.
import { filterFactory } from '@sisense/sdk-data';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MockedSisenseContextProvider } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { MenuProvider } from '@/infra/contexts/menu-provider/menu-provider.js';

import type { FilterTileConfig } from './filter-tile-config.js';
import { FilterTileMenuTargets } from './filter-tile-menu-targets.js';
import { FilterTile } from './filter-tile.js';

const renderTile = (config: FilterTileConfig) =>
  render(
    <MockedSisenseContextProvider>
      <MenuProvider>
        <FilterTile
          filter={filterFactory.greaterThan(DM.Commerce.Revenue, 100)}
          onChange={vi.fn()}
          config={config}
        />
      </MenuProvider>
    </MockedSisenseContextProvider>,
  );

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByLabelText('Filter tile menu'));
};

describe('filter tile menu (integration)', () => {
  it('renders a consumer-supplied item and runs its handler when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderTile({
      header: {
        menu: { items: [{ type: 'action', id: 'copy-values', caption: 'Copy values', onClick }] },
      },
    });

    await openMenu(user);
    await user.click(await screen.findByText('Copy values'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('lists the built-in lock item before consumer items', async () => {
    const user = userEvent.setup();
    renderTile({
      header: {
        menu: { items: [{ type: 'action', id: 'custom', caption: 'Custom', onClick: vi.fn() }] },
      },
    });

    await openMenu(user);

    // `Lock` is contributed by the tile itself and must lead the menu — the ordering the header-menu
    // architecture calls `auto`.
    const captions = (await screen.findAllByRole('menuitem')).map((item) => item.textContent);
    expect(captions).toEqual(['Lock', 'Custom']);
  });

  it('opens a submenu and runs a nested handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderTile({
      header: {
        menu: {
          items: [
            {
              type: 'submenu',
              id: 'more',
              caption: 'More',
              items: [{ type: 'action', id: 'nested', caption: 'Nested action', onClick }],
            },
          ],
        },
      },
      actions: { lockFilter: { enabled: false } },
    });

    await openMenu(user);
    await user.click(await screen.findByText('More'));
    await user.click(await screen.findByText('Nested action'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders no menu button at all when the menu is disabled', async () => {
    renderTile({
      header: {
        menu: {
          enabled: false,
          items: [{ type: 'action', id: 'custom', caption: 'Custom', onClick: vi.fn() }],
        },
      },
      actions: { lockFilter: { enabled: true } },
    });

    await screen.findByTestId('csdk-filter-tile-container');
    expect(screen.queryByLabelText('Filter tile menu')).toBeNull();
  });

  it('reserves the built-in lock id publicly so a consumer can avoid colliding with it', () => {
    expect(FilterTileMenuTargets.Lock).toBe('filter-tile-menu-lock');
  });
});
