import type { DeepRequired } from 'ts-essentials';

import { FiltersPanelConfig } from './types.js';

/**
 * Default configuration for the filters panel
 */
export const DEFAULT_FILTERS_PANEL_CONFIG: DeepRequired<FiltersPanelConfig> = {
  actions: {
    addFilter: {
      enabled: false,
      multiSelect: {
        visible: true,
      },
      ranking: {
        visible: true,
      },
    },
    editFilter: {
      enabled: false,
      multiSelect: {
        visible: true,
      },
      ranking: {
        visible: true,
      },
    },
    deleteFilter: {
      enabled: false,
    },
    reorderFilters: {
      enabled: false,
    },
    lockFilter: {
      enabled: false,
    },
    toggleFilter: {
      visible: true,
    },
    expandFilter: {
      visible: true,
    },
  },
};

/**
 * Border settings for the filters panel
 */
export const BORDER_COLOR = '#dadada';
export const BORDER_THICKNESS = '1px';

/**
 * Minimum width for filter tiles in the filters panel
 */
export const FILTER_TILE_MIN_WIDTH = 214;
