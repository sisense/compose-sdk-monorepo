import { describe, expect, it } from 'vitest';

import { FilterTileMenuTargets } from './filter-tile-menu-targets.js';

describe('FilterTileMenuTargets', () => {
  // The ids are public API: a custom menu item is required not to collide with them, so a
  // consumer may hardcode or compare against these strings. Changing one is a breaking change.
  it('pins the reserved built-in menu item ids', () => {
    expect(FilterTileMenuTargets).toEqual({ Lock: 'filter-tile-menu-lock' });
  });
});
