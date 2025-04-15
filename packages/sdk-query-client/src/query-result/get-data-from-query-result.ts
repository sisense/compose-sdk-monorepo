/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Cell, Column, DataCell, Element, QueryResultData } from '@sisense/sdk-data';
import { simpleColumnType } from '@sisense/sdk-data';
import numeral from 'numeral';

import { JaqlResponse } from '../types.js';

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
  // A boolean flag indicating whether highlight is enabled on some column.
  let isHighlightEnabledSomeColumn = false;
  // An array indicating whether highlight is enabled per each column.
  const highlightEnabledPerColumn = rows[0]?.map((_value, index) => {
    const isHighlightEnabled = rows.some((r) => 'selected' in r[index]);
    if (isHighlightEnabled) {
      isHighlightEnabledSomeColumn = true;
    }
    return isHighlightEnabled;
  });

  return rows.map((r) => {
    // calculates a single `blur` value for a whole row based on each column (cell) configuration.
    // true: the data value is blurred
    // false: the data value is highlighted
    // undefined: the data value is neutral (neither highlighted nor blurred)
    const blur = !isHighlightEnabledSomeColumn
      ? undefined
      : highlightEnabledPerColumn.some(
          (isHighlightEnabled, columnIndex) => isHighlightEnabled && !r[columnIndex].selected,
        );

    return r.map(
      (d): Cell =>
        blur !== undefined
          ? {
              data: d.data,
              text: d.text,
              blur,
            }
          : { data: d.data, text: d.text },
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
