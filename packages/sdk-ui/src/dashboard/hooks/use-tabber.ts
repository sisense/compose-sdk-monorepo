import { PluginWidgetProps, WidgetProps } from '@/props';
import { WidgetPanelLayoutManager } from '@/dashboard/hooks/use-widgets-layout';
import { TabberTab } from '@/types';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { TabbersOptions, WidgetsPanelColumnLayout } from '@/models';

export type UseTabber = ({
  widgets,
  config,
}: {
  widgets: WidgetProps[];
  config?: TabbersOptions | undefined;
}) => {
  layoutManager: WidgetPanelLayoutManager;
  widgets: WidgetProps[];
};

export type SingleTabberConfig = {
  tabs: TabberTab[];
  activeTab: number;
};

export const isTabberWidget = (widget: WidgetProps): boolean => {
  return (widget as PluginWidgetProps).pluginType === 'WidgetsTabber';
};

/**
 * For each tabber widget config, the tab is visible in case it is either visible or not controlled by the tabber config at all.
 */
function isVisible(
  widgetId: string,
  tabbersOptions: TabbersOptions,
  tabberState: Record<string, number>,
): boolean {
  for (const tabberOid of Object.keys(tabbersOptions)) {
    const tabberConfig = tabbersOptions[tabberOid];
    const activeTab = tabberConfig.tabs[tabberState[tabberOid]];
    const currentConfigAffectsWidget = tabberConfig.tabs.some((tab) =>
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
  (tabbersOptions: TabbersOptions, tabberState: Record<string, number>) =>
  (layout: WidgetsPanelColumnLayout): WidgetsPanelColumnLayout => {
    return {
      ...layout,
      columns: layout.columns
        .map((column) => {
          return {
            ...column,
            rows: column.rows
              .map((row) => {
                const filteredCells = row.cells.filter((cell) => {
                  return isVisible(cell.widgetId, tabbersOptions, tabberState);
                });
                if (filteredCells.length === row.cells.length) {
                  return row;
                }
                return filteredCells.length === row.cells.length
                  ? row
                  : {
                      cells: filteredCells.map((cell) => {
                        return {
                          ...cell,
                          widthPercentage: 100 / filteredCells.length,
                        };
                      }),
                    };
              })
              .filter((row) => row.cells.length > 0),
          };
        })
        .filter((column) => column.rows.length > 0),
    };
  };

const getSelectedTabs = (config: TabbersOptions): Record<string, number> => {
  return Object.keys(config).reduce((acc, key) => {
    acc[key] = config[key].activeTab;
    return acc;
  }, {});
};

export const useTabber: UseTabber = ({ widgets, config: tabbersConfigs = {} }) => {
  const initialSelectedTabs = useMemo(() => getSelectedTabs(tabbersConfigs), [tabbersConfigs]);
  const [selectedTabs, setSelectedTabs] = useState<Record<string, number>>(initialSelectedTabs);

  useEffect(() => {
    const newSelectedTabs = getSelectedTabs(tabbersConfigs);
    setSelectedTabs((prevSelectedTabs) => {
      const shouldUpdate = Object.keys(newSelectedTabs).some(
        (key) => prevSelectedTabs[key] !== newSelectedTabs[key],
      );
      return shouldUpdate ? newSelectedTabs : prevSelectedTabs;
    });
  }, [tabbersConfigs]);

  const widgetsWithTabberSubscription = widgets.map((widget) => {
    if (isTabberWidget(widget)) {
      return {
        ...widget,
        onTabSelected: (tab: number) => {
          setSelectedTabs((prev) => {
            return { ...prev, [widget.id]: tab };
          });
        },
        selectedTab: selectedTabs[widget.id] || 0,
      };
    }
    return widget;
  });

  const layoutModifier = useCallback(
    (layout: WidgetsPanelColumnLayout): WidgetsPanelColumnLayout => {
      return {
        ...layout,
        columns: layout.columns
          .map((column) => {
            return {
              ...column,
              rows: column.rows
                .map((row) => {
                  const filteredCells = row.cells.filter((cell) => {
                    return isVisible(cell.widgetId, tabbersConfigs, selectedTabs);
                  });
                  if (filteredCells.length === row.cells.length) {
                    return row;
                  }
                  return filteredCells.length === row.cells.length
                    ? row
                    : {
                        cells: filteredCells.map((cell) => {
                          return {
                            ...cell,
                            widthPercentage: 100 / filteredCells.length,
                          };
                        }),
                      };
                })
                .filter((row) => row.cells.length > 0),
            };
          })
          .filter((column) => column.rows.length > 0),
      };
    },
    [tabbersConfigs, selectedTabs],
  );

  return {
    layoutManager: { manageLayout: layoutModifier, name: 'TabberWidget' },
    widgets: widgetsWithTabberSubscription,
  };
};
