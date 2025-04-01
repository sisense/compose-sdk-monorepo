import type { DeepRequired } from 'ts-essentials';
import { DashboardByIdConfig, DashboardConfig } from './types';

export const DASHBOARD_DIVIDER_COLOR = '#d5d5d5';
export const DASHBOARD_DIVIDER_WIDTH = 1;
export const DEFAULT_DASHBOARD_CONFIG: DeepRequired<DashboardConfig> = {
  filtersPanel: {
    visible: true,
    collapsedInitially: false,
    persistCollapsedStateToLocalStorage: false,
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
  },
  toolbar: {
    visible: true,
  },
  widgetsPanel: {
    responsive: false,
  },
};
export const DEFAULT_DASHBOARD_BY_ID_CONFIG: DeepRequired<DashboardByIdConfig> = {
  ...DEFAULT_DASHBOARD_CONFIG,
  persist: false,
};
