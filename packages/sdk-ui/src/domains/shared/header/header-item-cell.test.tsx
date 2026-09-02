/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HeaderItemCell } from './header-item-cell.js';
import { createHeaderSpacerItem } from './header-spacer-item.js';

describe('HeaderItemCell', () => {
  it('renders the item content inside the cell', () => {
    const { getByTestId } = render(
      <HeaderItemCell item={{ id: 'menu', component: () => <button>Menu</button> }} />,
    );

    expect(getByTestId('header-item-menu')).toHaveTextContent('Menu');
  });

  describe('pointer events', () => {
    // A host that lays its header over the component body switches pointer events off for the whole
    // strip; the cells decide which parts of it are clickable again. An empty cell — a spacer above
    // all, which absorbs the free width — must stay transparent, or it swallows clicks meant for the
    // content underneath.
    it('takes pointer events when the item drew content', () => {
      const { getByTestId } = render(
        <HeaderItemCell item={{ id: 'menu', component: () => <button>Menu</button> }} />,
      );

      expect(getByTestId('header-item-menu').style.pointerEvents).toBe('auto');
    });

    it('stays transparent for a spacer', () => {
      const { getByTestId } = render(<HeaderItemCell item={createHeaderSpacerItem('spacer')} />);

      expect(getByTestId('header-item-spacer').style.pointerEvents).toBe('none');
    });

    it.each([
      ['null', () => null],
      ['undefined', () => undefined],
      ['false', () => false],
      ['an empty string', () => ''],
    ])('stays transparent for an item rendering %s', (_label, component) => {
      const { getByTestId } = render(<HeaderItemCell item={{ id: 'conditional', component }} />);

      expect(getByTestId('header-item-conditional').style.pointerEvents).toBe('none');
    });
  });
});
