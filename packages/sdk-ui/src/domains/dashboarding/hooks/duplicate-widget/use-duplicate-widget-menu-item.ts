import { useCallback, useMemo } from 'react';

import { v4 as uuid } from 'uuid';

import type {
  SpecificWidgetOptions,
  WidgetsOptions,
  WidgetsPanelLayout,
} from '@/domains/dashboarding/dashboard-model/types.js';
import type { TabberConfig, TabbersConfig } from '@/domains/dashboarding/hooks/use-tabber.js';
import { type WidgetProps } from '@/domains/widgets/components/widget/types.js';
import { withHeaderMenuItem } from '@/domains/widgets/helpers/header-menu-utils.js';

import type { DashboardPersistenceManager } from '../../persistence/types.js';
import {
  getWidgetCellLocation,
  withNewCellInsertedToTheSameRow,
} from './duplicate-widget-utils.js';

/** Setter for widgets array (e.g. React setState or updater function). */
export type SetWidgets = React.Dispatch<React.SetStateAction<WidgetProps[]>>;

/** Setter for widgets options array (e.g. React setState or updater function). */
export type SetWidgetsOptions = React.Dispatch<React.SetStateAction<WidgetsOptions>>;

/** Setter for the dashboard-level tabbers config (e.g. React setState or updater function). */
export type SetTabbersConfig = React.Dispatch<React.SetStateAction<TabbersConfig>>;

/** Setter for widgets panel layout. */
export type SetWidgetsLayout = (newLayout: WidgetsPanelLayout) => void;

/** Options for the duplicate widget middleware hook. */
export type UseDuplicateWidgetMenuItemParams = {
  /** Current widgets. */
  widgets: WidgetProps[];
  /** Setter to update widgets (e.g. from parent state). */
  setWidgets: SetWidgets;
  /** Current widgets panel layout. */
  widgetsLayout: WidgetsPanelLayout;
  /** Setter to update widgets layout (e.g. from parent state). */
  setWidgetsLayout: SetWidgetsLayout;

  /** When false, returns widgets unchanged (no menu item added). */
  enabled?: boolean;

  /** Dashboard-level widget options (applied to cloned widget when persisting). */
  widgetsOptions?: WidgetsOptions;
  /** Setter to update widgets options (e.g. from parent state). */
  setWidgetsOptions: SetWidgetsOptions;

  /** Dashboard-level tabbers config (copied to the cloned widget so its tab show/hide mapping survives). */
  tabbersConfig?: TabbersConfig;
  /** Setter to update the tabbers config (e.g. from parent state). */
  setTabbersConfig?: SetTabbersConfig;

  persistence?: Pick<DashboardPersistenceManager, 'addWidget'>;
};

/** Output of the duplicate widget middleware. */
export type DuplicateWidgetMiddlewareOutput = {
  widgets: WidgetProps[];
};

/**
 * Middleware hook that adds a "Duplicate widget" header menu item to each widget.
 * On click, clones the widget and updates the layout (inserts new cell in the same row).
 *
 * @param options - Options containing widgets, layout, setters, and enabled flag.
 * @returns Updated props with widgets augmented with the duplicate menu item (or unchanged when disabled).
 *
 * @example
 * ```ts
 * const [widgets, setWidgets] = useSyncedState(initialWidgets);
 * const [widgetsLayout, setWidgetsLayout] = useSyncedState(initialLayout);
 * const { widgets: widgetsWithDuplicate, widgetsLayout: widgetsLayoutWithDuplicate } = useDuplicateWidgetMenuItem({
 *   widgets,
 *   setWidgets,
 *   widgetsLayout,
 *   setWidgetsLayout,
 *   enabled: true,
 * });
 * const { layout: widgetsLayout, setLayout: setWidgetsLayout } = useWidgetsLayoutManagement({
 *   layout: widgetsLayoutWithDuplicate,
 *   layoutManagers: [tabberLayoutManager],
 * });
 * ```
 */
export function useDuplicateWidgetMenuItem(
  params: UseDuplicateWidgetMenuItemParams,
): DuplicateWidgetMiddlewareOutput {
  const {
    widgets,
    setWidgets,
    widgetsLayout,
    setWidgetsLayout,
    enabled = false,
    widgetsOptions,
    setWidgetsOptions,
    tabbersConfig,
    setTabbersConfig,
    persistence,
  } = params;

  const duplicateWidget = useCallback(
    async (widgetId: string) => {
      const location = getWidgetCellLocation(widgetsLayout, widgetId);
      if (!location) {
        return;
      }
      const original = widgets.find((w) => w.id === widgetId);
      if (!original) return;

      const tempWidgetId = `${widgetId}-copy-${uuid()}`;
      const clonedWidget: WidgetProps = { ...original, id: tempWidgetId };
      const newLayout = withNewCellInsertedToTheSameRow(location, tempWidgetId)(widgetsLayout);

      const widgetOptions: SpecificWidgetOptions | undefined = widgetsOptions?.[widgetId];
      // Tabber show/hide mapping lives at the dashboard level (config.tabbers), keyed by the
      // tabber widget's id — carry it so the duplicated tabber keeps controlling its widgets.
      const tabberConfig: TabberConfig | undefined = tabbersConfig?.[widgetId];

      if (persistence) {
        try {
          // Persistence layer may return the persisted widget (with guaranteed storage-layer uniqueness), layout and options.
          // We need to use the returned values to update the temporal local id-related state.
          const {
            widget: storedWidget,
            widgetsPanelLayout: storedWidgetsPanelLayout,
            widgetOptions: storedWidgetOptions,
            tabberConfig: storedTabberConfig,
          } = await persistence.addWidget(clonedWidget, newLayout, widgetOptions, tabberConfig);
          setWidgets((prev) => {
            const orig = prev.find((w) => w.id === widgetId);
            if (!orig) return prev;
            return [...prev, storedWidget];
          });
          setWidgetsLayout(storedWidgetsPanelLayout);
          setWidgetsOptions((prev) => ({ ...prev, [storedWidget.id]: storedWidgetOptions ?? {} }));
          if (storedTabberConfig && setTabbersConfig) {
            setTabbersConfig((prev) => ({ ...prev, [storedWidget.id]: storedTabberConfig }));
          }
        } catch (error) {
          console.error('[useDuplicateWidgetMenuItem] Failed to persist duplicated widget:', error);
        }
      } else {
        setWidgets((prev) => [...prev, clonedWidget]);
        setWidgetsLayout(newLayout);
        setWidgetsOptions((prev) => ({ ...prev, [tempWidgetId]: widgetOptions ?? {} }));
        if (tabberConfig && setTabbersConfig) {
          setTabbersConfig((prev) => ({ ...prev, [tempWidgetId]: tabberConfig }));
        }
      }
    },
    [
      widgets,
      widgetsLayout,
      widgetsOptions,
      tabbersConfig,
      setWidgets,
      setWidgetsLayout,
      setWidgetsOptions,
      setTabbersConfig,
      persistence,
    ],
  );

  const widgetsWithDuplicateMenuItem = useMemo(
    () =>
      enabled
        ? widgets.map((widget) =>
            withHeaderMenuItem({
              id: 'duplicate-widget',
              caption: 'Duplicate widget',
              onClick: () => void duplicateWidget(widget.id),
            })(widget),
          )
        : [...widgets],
    [widgets, duplicateWidget, enabled],
  );

  return { widgets: widgetsWithDuplicateMenuItem };
}
