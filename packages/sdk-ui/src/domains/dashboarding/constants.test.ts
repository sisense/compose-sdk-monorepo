import omit from 'lodash-es/omit';
import { describe, expect, it } from 'vitest';

import { DEFAULT_DASHBOARD_BY_ID_CONFIG, DEFAULT_DASHBOARD_CONFIG } from './constants.js';

describe('dashboard config defaults', () => {
  describe('filtersPanel.actions.lockFilter', () => {
    // Locking is granted by whoever is the authority for the surface: the developer composing a
    // dashboard from props, or Fusion for one loaded by id. These two defaults are what encode that
    // split, and `DEFAULT_DASHBOARD_BY_ID_CONFIG` spreads the other one shallowly — so an added
    // `filtersPanel` key upstream would silently take the override with it.
    it('is on for a dashboard assembled from props', () => {
      expect(DEFAULT_DASHBOARD_CONFIG.filtersPanel.actions.lockFilter.enabled).toBe(true);
    });

    it('is off for a dashboard loaded by id, leaving Fusion permissions the only grant', () => {
      expect(DEFAULT_DASHBOARD_BY_ID_CONFIG.filtersPanel.actions.lockFilter.enabled).toBe(false);
    });

    it('keeps every other filters-panel default shared between the two', () => {
      expect(omit(DEFAULT_DASHBOARD_BY_ID_CONFIG.filtersPanel.actions, 'lockFilter')).toEqual(
        omit(DEFAULT_DASHBOARD_CONFIG.filtersPanel.actions, 'lockFilter'),
      );
    });
  });
});
