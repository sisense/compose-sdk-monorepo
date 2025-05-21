import type { DeepRequired } from 'ts-essentials';
import { DashboardByIdConfig, DashboardConfig } from './types';

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
    editMode: false,
  },
};
export const DEFAULT_DASHBOARD_BY_ID_CONFIG: DeepRequired<DashboardByIdConfig> = {
  ...DEFAULT_DASHBOARD_CONFIG,
  persist: false,
};
