import { Attribute, Column } from '@sisense/sdk-data';

import { getSelectableWidgetAttributes } from '@/domains/dashboarding/common-filters/selection-utils';
import { PivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/types';
import {
  getDataOptionByLocation,
  getDataOptionLocation,
  isSameColumn,
  setDataOptionAtLocation,
} from '@/shared/utils/data-option-location';
import { DataOptionLocation, DrilldownSelection, StyledColumn } from '@/types';

/**
 * Gets the initial dimension location for pivot table drilldown.
 *
 * @param dataOptions - The data options of the pivot table.
 * @param drilldownTarget - The target of the drilldown (Attribute or DataOptionLocation).
 * @param drilldownSelections - The current drilldown selections.
 * @returns The initial dimension location.
 */
export function getInitialDimensionLocation(
  dataOptions: PivotTableDataOptions,
  drilldownTarget: Attribute | DataOptionLocation,
  drilldownSelections: DrilldownSelection[],
): DataOptionLocation | undefined {
  // Return undefined initial dimension location if there are no selections
  if (drilldownSelections.length === 0 || !drilldownTarget) {
    return undefined;
  }

  const isDataOptionLocation = 'dataOptionName' in drilldownTarget;
  if (isDataOptionLocation) {
    return drilldownTarget;
  }

  return getDataOptionLocation(dataOptions, drilldownTarget);
}

/**
 * Checks if drilldown is applicable to a pivot table.
 * Drilldown requires the pivot table to have at least one selectable attribute (row or column dimension).
 */
export function isDrilldownApplicableToPivot(dataOptions: PivotTableDataOptions): boolean {
  const selectableAttributes = getSelectableWidgetAttributes('pivot', dataOptions);
  return selectableAttributes.length > 0;
}

/**
 * Applies a drilldown dimension to pivot table data options.
 * Replaces the target dimension (first row or column that doesn't match the drilldown dimension).
 */
export function applyDrilldownDimensionToPivot(
  dataOptions: PivotTableDataOptions,
  drilldownDimensionLocation: DataOptionLocation,
  drilldownDimension: Column,
): PivotTableDataOptions {
  const existingDataOption = getDataOptionByLocation<Column | StyledColumn>(
    dataOptions,
    drilldownDimensionLocation,
  );

  if (!existingDataOption || isSameColumn(existingDataOption, drilldownDimension)) {
    return dataOptions;
  }

  return setDataOptionAtLocation(drilldownDimension, drilldownDimensionLocation, dataOptions);
}
