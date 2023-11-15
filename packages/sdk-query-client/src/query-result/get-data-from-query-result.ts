/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import numeral from 'numeral';
import { Cell, Column, DataCell, Element, QueryResultData } from '@sisense/sdk-data';
import { JaqlResponse } from '../types.js';
import { simpleColumnType } from '@sisense/sdk-data';

export const getDataFromQueryResult = (
  result: JaqlResponse,
  metadata: Element[],
): QueryResultData => {
  const values = getQueryResultValues(result);
  return prepareResultAsColsAndRows(values, metadata);
};

export function prepareResultAsColsAndRows(
  data: DataCell[][],
  metadata: Element[],
): QueryResultData {
  return {
    columns: metadata?.map((d: Column) => ({
      name: d.name,
      type: simpleColumnType(d.type),
    })),
    rows: setCellsBlur(data),
  };
}

/**
 * Sets the `blur` property for each cell in a 2D array of data cells based on the `selected` property.
 *
 * @param rows - The 2D array of data cells representing rows and columns.
 * @returns A new 2D array of cells with the `blur` property set.
 */
export function setCellsBlur(rows: DataCell[][]): Cell[][] {
  // An array indicating whether `blur` is enabled per each column.
  const blurEnabledPerColumn = rows[0]?.map((_value, index) => {
    return rows.some((r) => 'selected' in r[index]);
  });

  return rows.map((r) => {
    // calculates a single `blur` value for a whole row based on each column (cell) configuration.
    const blur = blurEnabledPerColumn.some((isBlurEnabled, columnIndex) => {
      return isBlurEnabled && !r[columnIndex].selected;
    });

    return r.map(
      (d): Cell => ({
        data: d.data,
        text: d.text,
        blur,
      }),
    );
  });
}

export function getQueryResultValues({ values = [], metadata = [] }: JaqlResponse): DataCell[][] {
  // fixing measures query result
  if (values[0] && !Array.isArray(values[0])) {
    values = [values as Cell[]];
  }

  for (let i = 0; i < values.length; i++) {
    const row = values[i] as Cell[];

    for (let c = 0; c < row.length; c++) {
      if (metadata[c].format && metadata[c]?.format?.number) {
        row[c].text = numeral(row[c].data).format(metadata[c]?.format?.number);
      }
    }
  }

  return values as DataCell[][];
}
