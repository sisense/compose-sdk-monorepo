import type { DeepRequired } from 'ts-essentials';
import { FiltersPanelConfig } from './types';

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
    },
    editFilter: {
      enabled: false,
      multiSelect: {
        visible: true,
      },
    },
    deleteFilter: {
      enabled: false,
    },
  },
};
