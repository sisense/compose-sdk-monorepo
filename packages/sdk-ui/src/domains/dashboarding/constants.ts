import type { DeepRequired } from 'ts-essentials';

import {
  DashboardByIdConfig,
  DashboardConfig,
  EditModeConfig,
  WidgetsPanelConfig,
} from './types.js';

export const DEFAULT_DASHBOARD_CONFIG: DeepRequired<
  Omit<DashboardConfig, 'widgetsPanel' | 'tabbers'> & {
    widgetsPanel: Omit<WidgetsPanelConfig, 'editMode'> & {
      editMode: Omit<EditModeConfig, 'isEditing'>;
    };
  }
> = {
  filtersPanel: {
    visible: true,
    collapsedInitially: false,
    persistCollapsedStateToLocalStorage: false,
    showFilterIconInToolbar: false,
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
      reorderFilters: {
        enabled: false,
      },
      lockFilter: {
        enabled: false,
      },
    },
  },
  toolbar: {
    visible: true,
  },
  widgetsPanel: {
    responsive: false,
    editMode: {
      duplicateWidget: { enabled: false },
      enabled: false,
      showDragHandleIcon: true,
      applyChangesAsBatch: {
        enabled: true,
        historyLimit: 20,
      },
    },
  },
};

export const DEFAULT_DASHBOARD_BY_ID_CONFIG: DeepRequired<
  Omit<DashboardByIdConfig, 'widgetsPanel' | 'tabbers'> & {
    widgetsPanel: Omit<WidgetsPanelConfig, 'editMode'> & {
      editMode: Omit<EditModeConfig, 'isEditing'>;
    };
  }
> = {
  ...DEFAULT_DASHBOARD_CONFIG,
  persist: false,
  sharedMode: false,
};
