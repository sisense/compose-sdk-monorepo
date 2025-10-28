import { useCallback, useMemo } from 'react';

import { useSyncedState } from '@/common/hooks/use-synced-state';
import { WidgetPanelLayoutManager } from '@/dashboard/hooks/use-widgets-layout';
import { WidgetId, WidgetsPanelColumnLayout } from '@/models';
import { CustomWidgetProps, TabberButtonsWidgetProps, WidgetProps } from '@/props';

/**
 * @internal
 */
export type UseTabber = ({
  widgets,
  config,
}: {
  widgets: WidgetProps[];
  config?: TabbersConfig | undefined;
}) => {
  layoutManager: WidgetPanelLayoutManager;
  widgets: WidgetProps[];
};

/**
 * Configuration for a single tab in a tabber widget.
 */
export type TabberTabConfig = {
  /**
   * Widget IDs from the dashboard to display in the tab.
   */
  displayWidgetIds: string[];
};

/**
 * Configuration for a tabber widget.
 */
export type TabberConfig = {
  /**
   * Tabs configuration for the tabber widget.
   */
  tabs: TabberTabConfig[];
};

/**
 * Configuration for tabbers in a dashboard.
 * It includes separate configuration for each tabber.
 */
export type TabbersConfig = Record<WidgetId, TabberConfig>;

export const isTabberButtonsWidget = (widget: WidgetProps): widget is TabberButtonsWidgetProps => {
  return (widget as CustomWidgetProps).customWidgetType === 'tabber-buttons';
};

/**
 * For each tabber widget config, the tab is visible in case it is either visible or not controlled by the tabber config at all.
 */
function isVisible(
  widgetId: string,
  tabbersOptions: TabbersConfig,
  tabberState: Record<string, number>,
): boolean {
  for (const tabberOid of Object.keys(tabbersOptions)) {
    const tabberConfig = tabbersOptions[tabberOid];
    const activeIndex = tabberState[tabberOid] ?? 0;
    const activeTab = tabberConfig.tabs[activeIndex];
    const currentConfigAffectsWidget = tabberConfig.tabs.some((tab: TabberTabConfig) =>
      tab.displayWidgetIds.includes(widgetId),
    );
    if (!currentConfigAffectsWidget) {
      continue;
    }

    if (!activeTab?.displayWidgetIds?.includes(widgetId)) {
      return false;
    }
  }
  return true;
}

export const modifyLayout =
  (tabbersOptions: TabbersConfig, tabberState: Record<string, number>) =>
  (layout: WidgetsPanelColumnLayout): WidgetsPanelColumnLayout => {
    const isAnyTabberConfig = Object.keys(tabbersOptions).length > 0;

    return {
      ...layout,
      columns: layout.columns.map((column) => {
        return {
          ...column,
          rows: column.rows.map((row) => {
            return {
              ...row,
              cells: row.cells.map((cell) => {
                return {
                  ...cell,
                  ...(isAnyTabberConfig
                    ? { hidden: !isVisible(cell.widgetId, tabbersOptions, tabberState) }
                    : null),
                };
              }),
            };
          }),
        };
      }),
    };
  };

/**
 * Gets the selected tabs from the list of widget props.
 * Returns a record of widget IDs and the index of the selected tab for each tabber widget.
 * @param widgets - The list of widget props.
 * @returns A record of widget IDs and the index of the selected tab for each tabber widget.
 */
const getSelectedTabsFromWidgets = (widgets: WidgetProps[]): Record<string, number> => {
  return widgets.reduce((acc: Record<string, number>, widget) => {
    if (isTabberButtonsWidget(widget) && widget.customOptions) {
      acc[widget.id] = widget.customOptions.activeTab ?? 0;
    }
    return acc;
  }, {});
};

/**
 * Hook that manages the selected tabs state for tabber widgets.
 * Synchronizes internal state with widget props and provides a setter for tab changes.
 * @param widgets - The list of widget props.
 * @returns A tuple of [selectedTabs, setSelectedTabs] where selectedTabs is a record of widget IDs to tab indices.
 * @internal
 */
const useSelectedTabs = (
  widgets: WidgetProps[],
): [Record<string, number>, React.Dispatch<React.SetStateAction<Record<string, number>>>] => {
  // Extract activeTab values from widget props
  const widgetTabs = useMemo(() => getSelectedTabsFromWidgets(widgets), [widgets]);

  // Sync internal state with widget props using the built-in hook
  return useSyncedState(widgetTabs);
};

/**
 * Hook that modifies widget properties so it became a tabber widget.
 * Incapsulates logic for updating layout via navigating tabs
 * @param widgets
 * @param tabbersConfigs
 * @internal
 */
export const useTabber: UseTabber = ({ widgets, config: tabbersConfigs = {} }) => {
  const [selectedTabs, setSelectedTabs] = useSelectedTabs(widgets);
  const isAnyTabberConfig = Object.keys(tabbersConfigs).length > 0;

  const widgetsWithTabberSubscription = useMemo(
    () =>
      widgets.map((widget): WidgetProps => {
        if (isTabberButtonsWidget(widget) && widget.customOptions) {
          return {
            ...widget,
            customOptions: {
              ...widget.customOptions,
              activeTab: selectedTabs[widget.id] ?? widget.customOptions.activeTab ?? 0,
              onTabSelected: (tab: number) => {
                setSelectedTabs((prev) => {
                  return { ...prev, [widget.id]: tab };
                });
              },
            },
          };
        }
        return widget;
      }),
    [widgets, selectedTabs, setSelectedTabs],
  );

  const layoutModifier = useCallback(
    (layout: WidgetsPanelColumnLayout): WidgetsPanelColumnLayout => {
      return {
        ...layout,
        columns: layout.columns.map((column) => {
          return {
            ...column,
            rows: column.rows.map((row) => {
              return {
                ...row,
                cells: row.cells.map((cell) => {
                  return {
                    ...cell,
                    ...(isAnyTabberConfig
                      ? { hidden: !isVisible(cell.widgetId, tabbersConfigs, selectedTabs) }
                      : null),
                  };
                }),
              };
            }),
          };
        }),
      };
    },
    [tabbersConfigs, selectedTabs, isAnyTabberConfig],
  );

  return {
    layoutManager: { manageLayout: layoutModifier, name: 'tabber-buttons' },
    widgets: widgetsWithTabberSubscription,
  };
};
