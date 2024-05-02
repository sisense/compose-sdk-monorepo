import { useState } from 'react';
import {
  PivotTableDataOptions,
  PivotTableDataOptionsInternal,
} from '../chart-data-options/types.js';
import { translatePivotTableDataOptions } from '../chart-data-options/translate-data-options.js';
import { PivotSortCriteria } from './sorting-utils.js';
import { safeCombine } from '@/chart-data-options/utils.js';

type UsePivotTableDataOptionsInternalResult = {
  dataOptionsInternal: PivotTableDataOptionsInternal;
  updateSort: (sortCriteria: PivotSortCriteria) => void;
};

/**
 * A hook that returns the JAQL request object from pivot table props.
 *
 * @internal
 */
export const usePivotTableDataOptionsInternal = ({
  dataOptions,
}: {
  dataOptions: PivotTableDataOptions;
}): UsePivotTableDataOptionsInternalResult => {
  const [dataOptionsInternal, setDataOptionsInternal] = useState<PivotTableDataOptionsInternal>(
    translatePivotTableDataOptions(dataOptions),
  );

  return {
    dataOptionsInternal,
    updateSort(sortCriteria: PivotSortCriteria) {
      setDataOptionsInternal({
        ...dataOptionsInternal,
        rows: dataOptionsInternal.rows?.map((row, index) => {
          const rowSortCriteria = sortCriteria.rows.find(({ rowIndex }) => rowIndex === index);

          if (!rowSortCriteria) {
            return row;
          }

          // remove existing row sorting if it was explicitly removed
          if (rowSortCriteria.sort === null) {
            return safeCombine(row, { sortType: undefined });
          }

          return safeCombine(row, { sortType: rowSortCriteria.sort });
        }),
      });
    },
  };
};
