/* eslint-disable max-lines-per-function */

import { useState, useCallback, useMemo } from 'react';
import { Attribute } from '@sisense/sdk-data';
import { DataPoint, MenuPosition, MenuItemSection } from '../types';
import { ContextMenu } from './common/context-menu';
import { DrilldownBreadcrumbs } from './common/drilldown-breadcrumbs';
import { useCustomDrilldown } from './common/custom-drilldown';
import { DrilldownWidgetProps } from '../props';

/**
 * React component designed to add drilldown functionality to any type of chart
 *
 * It acts as a wrapper around a given chart component, enhancing it with drilldown capabilities
 *
 * The widget offers several features including:
 * - A context menu for initiating drilldown actions (can be provided as a custom component)
 * - Breadcrumbs that not only allow for drilldown selection slicing but also
 * provide an option to clear the selection (can be provided as a custom component)
 * - Filters specifically created for drilldown operation
 * - An option to navigate to the next drilldown dimension
 *
 * When an `initialDimension` is specified, the `drilldownDimension` will automatically inherit its value,
 * even before any points on the chart are selected.
 * This allows for complete control over the chart's dimensions to be handed over to the DrilldownWidget
 *
 * @example
 * Example of using the `DrilldownWidget` component to
 * plot a custom React component that uses the `ExecuteQuery` component to
 * query the `Sample ECommerce` data source hosted in a Sisense instance.
 * ```tsx
 * <DrilldownWidget
 *   drilldownDimensions={[DM.Commerce.AgeRange, DM.Commerce.Gender, DM.Commerce.Condition]}
 *   initialDimension={DM.Category.Category}
 * >
 *   {({ drilldownFilters, drilldownDimension, onDataPointsSelected, onContextMenu }) => (
 *     <ExecuteQuery
 *       dataSource={DM.DataSource}
 *       dimensions={[drilldownDimension]}
 *       measures={measure.sum(DM.Commerce.Revenue)}
 *       filters={drilldownFilters}
 *     >
 *       {(data) => (
 *         <MyCustomChart
 *           rawData={data}
 *           onContextMenu={onContextMenu}
 *           onDataPointsSelected={onDataPointsSelected}
 *         />
 *       )}
 *     </ExecuteQuery>
 *   )}
 * </DrilldownWidget>
 * ```
 * @param props - DrilldownWidget properties
 * @returns DrilldownWidget wrapper component
 */
export const DrilldownWidget = ({
  drilldownDimensions,
  initialDimension,
  config,
  children,
}: DrilldownWidgetProps) => {
  const [selectedDataPoints, setSelectedDataPoints] = useState<DataPoint[]>([]);
  const [contextMenuPos, setContextMenuPos] = useState<null | MenuPosition>(null);

  const ContextMenuComponent = config?.contextMenuComponent ?? ContextMenu;
  const BreadcrumbsComponent = config?.breadcrumbsComponent ?? DrilldownBreadcrumbs;

  const {
    selectDrilldown,
    sliceDrilldownSelections,
    clearDrilldownSelections,
    availableDrilldowns,
    drilldownFilters,
    drilldownFiltersDisplayValues,
    drilldownDimension,
  } = useCustomDrilldown({
    drilldownDimensions,
    initialDimension,
  });

  const breadcrumbs = useMemo(() => {
    return (
      drilldownDimension && (
        <BreadcrumbsComponent
          filtersDisplayValues={drilldownFiltersDisplayValues}
          currentDimension={drilldownDimension}
          clearDrilldownSelections={clearDrilldownSelections}
          sliceDrilldownSelections={sliceDrilldownSelections}
        />
      )
    );
  }, [
    BreadcrumbsComponent,
    clearDrilldownSelections,
    drilldownDimension,
    drilldownFiltersDisplayValues,
    sliceDrilldownSelections,
  ]);

  const openContextMenu = (menuPos: { top: number; left: number }) => {
    setContextMenuPos(menuPos);
  };

  const closeContextMenu = useCallback(() => {
    setSelectedDataPoints([]);
    setContextMenuPos(null);
  }, [setSelectedDataPoints]);

  const onMenuDrilldownClick = useCallback(
    (nextDimension: Attribute) => {
      selectDrilldown(selectedDataPoints, nextDimension);
    },
    [selectDrilldown, selectedDataPoints],
  );

  const onDataPointsSelected = useCallback(
    (points: DataPoint[]) => {
      setSelectedDataPoints(points);
    },
    [setSelectedDataPoints],
  );

  const drilldownMenuItems: MenuItemSection[] = useMemo(
    () => [
      ...(drilldownDimension ? [{ sectionTitle: drilldownDimension?.name }] : []),
      {
        sectionTitle: 'Drill',
        items: availableDrilldowns.map((nextDimension) => ({
          caption: nextDimension.name,
          onClick: () => onMenuDrilldownClick(nextDimension),
        })),
      },
    ],
    [drilldownDimension, availableDrilldowns, onMenuDrilldownClick],
  );

  return (
    <>
      <ContextMenuComponent
        position={contextMenuPos}
        itemSections={drilldownMenuItems}
        closeContextMenu={closeContextMenu}
      />
      {drilldownDimension && !config?.isBreadcrumbsDetached && breadcrumbs}
      {children({
        drilldownFilters,
        drilldownDimension,
        onDataPointsSelected,
        onContextMenu: openContextMenu,
        breadcrumbsComponent: config?.isBreadcrumbsDetached ? breadcrumbs : undefined,
      })}
    </>
  );
};
