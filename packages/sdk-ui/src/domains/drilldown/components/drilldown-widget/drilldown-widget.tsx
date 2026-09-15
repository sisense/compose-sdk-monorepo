import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Attribute } from '@sisense/sdk-data';

import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { DrilldownWidgetProps } from '@/props';
import { useHasChanged } from '@/shared/hooks/use-has-changed';
import { DataPoint, DrilldownSelection, MenuItemSection, MenuPosition } from '@/types';

import { Hierarchy } from '../../hierarchy-model/index';
import { useDrilldownCore } from '../../hooks/use-drilldown-core';
import { getDrilldownMenuItems, getSelectionTitleMenuItem } from '../../hooks/use-drilldown.js';
import { DrilldownBreadcrumbs } from '../drilldown-breadcrumbs/index';

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
 * @example
 * A column chart displaying total revenue by category from the Sample ECommerce data model. The chart can be drilled down by age range, gender, and condition.
 *
 * ```tsx
 * import { measureFactory } from '@sisense/sdk-data';
 * import { Chart, DataPoint, DrilldownWidget } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <DrilldownWidget
 *     drilldownPaths={[DM.Category.Category, DM.Commerce.Gender, DM.Commerce.Condition]}
 *     initialDimension={DM.Commerce.AgeRange}
 *   >
 *     {({ drilldownFilters, drilldownDimension, onDataPointsSelected, onContextMenu }) => {
 *       const onPointsSelected = (points: DataPoint[], nativeEvent: MouseEvent) => {
 *         onDataPointsSelected(points, nativeEvent);
 *         onContextMenu({ left: nativeEvent.clientX, top: nativeEvent.clientY });
 *       };
 *
 *       const onPointClick = (point: DataPoint, event: MouseEvent) => {
 *         onDataPointsSelected([point], event);
 *         onContextMenu({ left: event.clientX, top: event.clientY });
 *       };
 *
 *       return (
 *         <Chart
 *           dataSet={DM.DataSource}
 *           chartType={'column'}
 *           dataOptions={{
 *             category: [drilldownDimension],
 *             value: [measureFactory.sum(DM.Commerce.Revenue)],
 *             breakBy: [],
 *           }}
 *           filters={drilldownFilters}
 *           onDataPointsSelected={onPointsSelected}
 *           onDataPointContextMenu={onPointClick}
 *         />
 *       );
 *     }}
 *   </DrilldownWidget>
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://drilldown-widget-example-1.png" width="700px" />
 *
 * Variant with the breadcrumbs rendered separately from the chart, via `isBreadcrumbsDetached`:
 *
 * ```tsx
 * import { measureFactory } from '@sisense/sdk-data';
 * import { Chart, DataPoint, DrilldownBreadcrumbs, DrilldownWidget } from '@sisense/sdk-ui';
 * import * as DM from './sample-ecommerce';
 *
 * const CodeExample = () => (
 *   <DrilldownWidget
 *     drilldownPaths={[DM.Category.Category, DM.Commerce.Gender, DM.Commerce.Condition]}
 *     initialDimension={DM.Commerce.AgeRange}
 *     config={{ isBreadcrumbsDetached: true, breadcrumbsComponent: DrilldownBreadcrumbs }}
 *   >
 *     {({
 *       drilldownFilters,
 *       drilldownDimension,
 *       onDataPointsSelected,
 *       onContextMenu,
 *       breadcrumbsComponent,
 *     }) => {
 *       const onPointsSelected = (points: DataPoint[], nativeEvent: MouseEvent) => {
 *         onDataPointsSelected(points, nativeEvent);
 *         onContextMenu({ left: nativeEvent.clientX, top: nativeEvent.clientY });
 *       };
 *
 *       const onPointClick = (point: DataPoint, event: MouseEvent) => {
 *         onDataPointsSelected([point], event);
 *         onContextMenu({ left: event.clientX, top: event.clientY });
 *       };
 *
 *       return (
 *         <>
 *           <Chart
 *             dataSet={DM.DataSource}
 *             chartType={'column'}
 *             dataOptions={{
 *               category: [drilldownDimension],
 *               value: [measureFactory.sum(DM.Commerce.Revenue)],
 *               breakBy: [],
 *             }}
 *             filters={drilldownFilters}
 *             onDataPointsSelected={onPointsSelected}
 *             onDataPointContextMenu={onPointClick}
 *           />
 *           <div>{breadcrumbsComponent}</div>
 *         </>
 *       );
 *     }}
 *   </DrilldownWidget>
 * );
 *
 * export default CodeExample;
 * ```
 *
 * <img src="media://drilldown-widget-example-2.png" width="700px" />
 *
 * @param props - DrilldownWidget properties
 * @returns DrilldownWidget wrapper component
 * @group Drilldown
 */
export const DrilldownWidget = asSisenseComponent({
  componentName: 'DrilldownWidget',
  trackingConfig: { transparent: true },
  shouldSkipSisenseContextWaiting: true,
  shouldHaveOwnMenuRoot: true,
})((props: DrilldownWidgetProps) => {
  const { t: translate } = useTranslation();
  const {
    drilldownPaths = [],
    initialDimension,
    drilldownSelections,
    config,
    onChange,
    children,
  } = props;
  const { openMenu } = useMenu();
  const [selectedDataPoints, setSelectedDataPoints] = useState<DataPoint[]>([]);
  const [contextMenuPos, setContextMenuPos] = useState<null | MenuPosition>(null);
  const isContextMenuPositionChanged = useHasChanged(contextMenuPos);

  const CustomContextMenuComponent = config?.contextMenuComponent;
  const BreadcrumbsComponent = config?.breadcrumbsComponent ?? DrilldownBreadcrumbs;
  const onDrilldownSelectionsChange = useCallback(
    (selections: DrilldownSelection[]) => onChange?.({ drilldownSelections: selections }),
    [onChange],
  );

  const {
    selectDrilldown,
    sliceDrilldownSelections,
    clearDrilldownSelections,
    availableDrilldownPaths,
    drilldownFilters,
    drilldownFiltersDisplayValues,
    drilldownDimension,
  } = useDrilldownCore({
    drilldownPaths,
    initialDimension,
    initialDrilldownSelections: drilldownSelections,
    onDrilldownSelectionsChange,
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

  const openContextMenu = useCallback((menuPos: { top: number; left: number }) => {
    setContextMenuPos(menuPos);
  }, []);

  const closeContextMenu = useCallback(() => {
    setSelectedDataPoints([]);
    setContextMenuPos(null);
  }, [setSelectedDataPoints]);

  const onMenuDrilldownClick = useCallback(
    (nextDimension: Attribute, hierarchy?: Hierarchy) => {
      selectDrilldown(selectedDataPoints, nextDimension, hierarchy);
    },
    [selectDrilldown, selectedDataPoints],
  );

  const onDataPointsSelected = useCallback(
    (points: DataPoint[]) => {
      setSelectedDataPoints(points);
    },
    [setSelectedDataPoints],
  );

  const drilldownMenuItems: MenuItemSection[] = useMemo((): MenuItemSection[] => {
    const titleSection = getSelectionTitleMenuItem(selectedDataPoints, drilldownDimension);
    const drillSection = getDrilldownMenuItems(
      availableDrilldownPaths,
      drilldownDimension,
      onMenuDrilldownClick,
      translate,
    );
    return drillSection ? [titleSection, drillSection] : [titleSection];
  }, [
    drilldownDimension,
    availableDrilldownPaths,
    selectedDataPoints,
    onMenuDrilldownClick,
    translate,
  ]);

  /**
   * Note: The context menu is opened in the next render cycle to ensure that "drilldownMenuItems" is fully updated.
   * This is necessary due to the separate execution of "onDataPointsSelected" and "openContextMenu" in the drilldown interface.
   * If both functions are executed within the same render cycle, "openContextMenu" may use outdated "drilldownMenuItems"
   * because it depends on the points set by "onDataPointsSelected".
   */
  useEffect(() => {
    const shouldOpenMenu = contextMenuPos && isContextMenuPositionChanged;
    if (shouldOpenMenu && !CustomContextMenuComponent) {
      openMenu({ position: contextMenuPos, itemSections: drilldownMenuItems });
    }
  }, [
    contextMenuPos,
    isContextMenuPositionChanged,
    drilldownMenuItems,
    openMenu,
    CustomContextMenuComponent,
  ]);

  const memoizedChildren = useMemo(() => {
    return children({
      drilldownFilters,
      drilldownDimension,
      onDataPointsSelected,
      onContextMenu: openContextMenu,
      breadcrumbsComponent: config?.isBreadcrumbsDetached ? breadcrumbs : undefined,
    });
  }, [
    children,
    drilldownFilters,
    drilldownDimension,
    onDataPointsSelected,
    openContextMenu,
    config,
    breadcrumbs,
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {CustomContextMenuComponent && (
        <CustomContextMenuComponent
          position={contextMenuPos}
          itemSections={drilldownMenuItems}
          closeContextMenu={closeContextMenu}
        />
      )}
      {drilldownDimension && !config?.isBreadcrumbsDetached && breadcrumbs}
      <div
        style={{
          flexGrow: 1,
          // prevents 'auto' behavior of using content size as minimal for element
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {memoizedChildren}
      </div>
    </div>
  );
});
