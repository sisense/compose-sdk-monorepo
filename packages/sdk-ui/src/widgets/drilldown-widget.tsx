import { useState, useCallback, useMemo } from 'react';
import { Attribute } from '@sisense/sdk-data';
import { DataPoint, MenuPosition, MenuItemSection } from '../types';
import { ContextMenu } from './common/context-menu';
import { DrilldownBreadcrumbs } from './common/drilldown-breadcrumbs';
import { useCustomDrilldown } from './common/custom-drilldown';
import { DrilldownWidgetProps } from '../props';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';

/**
 * React component designed to add drilldown functionality to any type of chart.
 *
 * This component acts as a wrapper around a given chart component, enhancing it with drilldown capabilities.
 *
 * The widget offers several features including:
 * - A context menu for initiating drilldown actions (can be provided as a custom component)
 * - Breadcrumbs that not only allow for drilldown selection slicing but also
 * provide an option to clear the selection (can be provided as a custom component)
 * - Filters specifically created for drilldown operation
 * - An option to navigate to the next drilldown dimension
 *
 * When an `initialDimension` is specified, the `drilldownDimension` will automatically inherit its
 * value, even before any points on the chart are selected.
 * This allows for complete control over the chart's dimensions to be handed over to the `DrilldownWidget`.
 *
 * ## Example
 *
 * A column chart displaying total revenue by category from the Sample ECommerce data model. The chart can be drilled down by age range, gender, and condition.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=use-cases%2Fdrilldown&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * Additional drilldown examples:
 *
 * - [Detached Breadcrumbs](https://www.sisense.com/platform/compose-sdk/playground/?example=use-cases%2Fdrilldown-detached-breadcrumbs)
 *
 * @param props - DrilldownWidget properties
 * @returns DrilldownWidget wrapper component
 * @group Drilldown
 */
export const DrilldownWidget = asSisenseComponent({
  componentName: 'DrilldownWidget',
  trackingConfig: { transparent: true },
})(({ drilldownDimensions, initialDimension, config, children }: DrilldownWidgetProps) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ContextMenuComponent
        position={contextMenuPos}
        itemSections={drilldownMenuItems}
        closeContextMenu={closeContextMenu}
      />
      {drilldownDimension && !config?.isBreadcrumbsDetached && breadcrumbs}
      <div
        style={{
          flexGrow: 1,
          // prevents 'auto' behavior of using content size as minimal for element
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {children({
          drilldownFilters,
          drilldownDimension,
          onDataPointsSelected,
          onContextMenu: openContextMenu,
          breadcrumbsComponent: config?.isBreadcrumbsDetached ? breadcrumbs : undefined,
        })}
      </div>
    </div>
  );
});
