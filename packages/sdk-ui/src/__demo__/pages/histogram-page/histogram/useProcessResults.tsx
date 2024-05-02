import type { Data, QueryResultData } from '@sisense/sdk-data';
import { useMemo } from 'react';
import type { HistogramDataOptions } from '../Histogram';

export const FREQUENCY = 'frequency';

// Widget plug-in processResults: create Histogram frequency data
export const useProcessResults = ({
  binData,
  dataOptions,
}: {
  binData?: QueryResultData;
  dataOptions: HistogramDataOptions;
}) => {
  return useMemo(() => {
    if (!binData) return { columns: [], rows: [] };

    const rows: (number | string)[][] = [];
    binData.rows.forEach((_row, rowIndex) => {
      binData.columns.forEach((column, colIndex) => {
        if (colIndex >= dataOptions.category.length) {
          const row: (number | string)[] = [];
          const currentRow = binData.rows[rowIndex];
          if (currentRow) {
            dataOptions.category.forEach((_d, dimIndex) => {
              row.push(currentRow[dimIndex]?.data as number);
            });
            row.push(currentRow[colIndex]?.data as number);
            row.push(parseFloat(column.name));
            rows.push(row);
          }
        }
      });
    });

    return {
      columns: [
        ...dataOptions.category.map((d) => ({ name: d.name, type: d.type })),
        { name: FREQUENCY, type: 'number', aggregation: 'sum' },
        { name: dataOptions.value.name, type: 'number' },
      ],
      rows: rows,
    } as Data;
  }, [binData, dataOptions.value.name, dataOptions.category]);
};
