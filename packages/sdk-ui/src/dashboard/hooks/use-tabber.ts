import { useCallback, useEffect, useMemo, useState } from 'react';

import { WidgetPanelLayoutManager } from '@/dashboard/hooks/use-widgets-layout';
import { TabbersOptions, WidgetsPanelColumnLayout } from '@/models';
import { CustomWidgetProps, WidgetProps } from '@/props';
import { TabberTab } from '@/types';

/**
 * @internal
 */
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

/**
 * @internal
 */
export type SingleTabberConfig = {
  tabs: TabberTab[];
  activeTab: number;
};

export const isTabberWidget = (widget: WidgetProps): boolean => {
  return (widget as CustomWidgetProps).customWidgetType === 'WidgetsTabber';
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

const getSelectedTabs = (config: TabbersOptions): Record<string, number> => {
  return Object.keys(config).reduce((acc: Record<string, number>, key) => {
    acc[key] = config[key].activeTab;
    return acc;
  }, {});
};

/**
 * Hook that modifies widget properties so it became a tabber widget.
 * Incapsulates logic for updating layout via navigating tabs
 * @param widgets
 * @param tabbersConfigs
 * @internal
 */
export const useTabber: UseTabber = ({ widgets, config: tabbersConfigs = {} }) => {
  const initialSelectedTabs = useMemo(() => getSelectedTabs(tabbersConfigs), [tabbersConfigs]);
  const [selectedTabs, setSelectedTabs] = useState<Record<string, number>>(initialSelectedTabs);
  const isAnyTabberConfig = Object.keys(tabbersConfigs).length > 0;

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
    layoutManager: { manageLayout: layoutModifier, name: 'TabberWidget' },
    widgets: widgetsWithTabberSubscription,
  };
};
