import { JaqlSortDirection, getSortType } from '@sisense/sdk-data';
import { type SortingSettingsChangePayload } from '@sisense/sdk-pivot-client';
import isEqual from 'lodash-es/isEqual';
import isString from 'lodash-es/isString';
import { PivotTableDataOptionsInternal } from '..';
import type { SortDirection, PivotRowsSort } from '../types';

export type PivotRowsSortCriteria = {
  rowIndex: number;
  sort: PivotRowsSort | null;
};

export type PivotSortCriteria = {
  rows: PivotRowsSortCriteria[];
};

export function normalizePivotSort(sortType: SortDirection | PivotRowsSort) {
  return isString(sortType) ? { direction: sortType } : sortType;
}

function getSortBy(
  sortDetails: SortingSettingsChangePayload['sortDetails'],
  dataOptionsInternal: PivotTableDataOptionsInternal,
) {
  return {
    valuesIndex:
      sortDetails.field! -
      (dataOptionsInternal.rows || []).length -
      (dataOptionsInternal.columns || []).length,
    columnsMembersPath: Object.values(sortDetails.measurePath || {}),
  };
}

export function preparePivotRowsSortCriteriaList(
  { type, settings, sortDetails }: SortingSettingsChangePayload,
  dataOptionsInternal: PivotTableDataOptionsInternal,
): PivotRowsSortCriteria[] {
  if (type === 'simple') {
    const isSortedByMeasure = sortDetails.field! >= (dataOptionsInternal.rows || []).length;

    if (isSortedByMeasure) {
      return [
        {
          rowIndex: 0,
          sort: {
            direction: getSortType(settings[0].direction as JaqlSortDirection),
            by: getSortBy(sortDetails, dataOptionsInternal),
          },
        },
      ];
    }

    return [
      {
        rowIndex: sortDetails.field!,
        sort: {
          direction: getSortType(settings[0].direction as JaqlSortDirection),
        },
      },
    ];
  }

  // 'complex' sorting type
  return settings.reduce((sortCriteriaList: PivotRowsSortCriteria[], sortOptions, index) => {
    const rowDataOption = dataOptionsInternal.rows?.[index];
    const existingRowSort = rowDataOption?.sortType && normalizePivotSort(rowDataOption?.sortType);
    const newSort = {
      direction: getSortType(sortOptions.direction as JaqlSortDirection),
      by: getSortBy(sortDetails, dataOptionsInternal),
    };

    const shouldDisableRowSort = !sortOptions.selected && isEqual(existingRowSort?.by, newSort.by);

    if (shouldDisableRowSort) {
      sortCriteriaList.push({
        rowIndex: index,
        sort: null,
      });
    }

    if (sortOptions.selected) {
      sortCriteriaList.push({
        rowIndex: index,
        sort: newSort,
      });
    }

    return sortCriteriaList;
  }, []);
}
