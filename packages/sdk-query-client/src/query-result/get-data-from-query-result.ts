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

export function setCellsBlur(rows: DataCell[][]): Cell[][] {
  const selectedFieldFound = rows.some((r) => r[0].selected);

  return rows.map((r) =>
    r.map(
      (d): Cell => ({
        data: d.data,
        text: d.text,
        blur: selectedFieldFound && !r[0].selected,
      }),
    ),
  );
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
