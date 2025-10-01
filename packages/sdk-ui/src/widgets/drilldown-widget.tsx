import { useState, useCallback, useMemo, useEffect } from 'react';
import { Attribute } from '@ethings-os/sdk-data';
import { DataPoint, MenuPosition, MenuItemSection, DrilldownSelection } from '../types';
import { DrilldownBreadcrumbs } from './common/drilldown-breadcrumbs';
import { useDrilldownCore } from './common/use-drilldown-core';
import { DrilldownWidgetProps } from '../props';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { useMenu } from '@/common/hooks/use-menu';
import { useHasChanged } from '@/common/hooks/use-has-changed';
import { useTranslation } from 'react-i18next';
import { Hierarchy } from '@/models/hierarchy';
import { getDrilldownMenuItems, getSelectionTitleMenuItem } from './hooks/use-drilldown';

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
 * - [Detached Breadcrumbs](https://www.sisense.com/developers/playground/?example=use-cases%2Fdrilldown-detached-breadcrumbs)
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
    drilldownSelections,
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

  const drilldownMenuItems: MenuItemSection[] = useMemo(() => {
    return [
      getSelectionTitleMenuItem(selectedDataPoints, drilldownDimension),
      getDrilldownMenuItems(
        availableDrilldownPaths,
        drilldownDimension,
        onMenuDrilldownClick,
        translate,
      ),
    ];
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
