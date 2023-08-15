/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable max-lines */
import { ExecuteQuery } from '@sisense/sdk-ui';
import * as Semi from '../../data-model/semiconductor-data';

import { BinWaferMap, processResult } from './BinWaferMap';
import { Cell, QueryResultData, filters } from '@sisense/sdk-data';
import React, { useCallback, useMemo, useState } from 'react';
import { Toolbar } from '../common/Toolbar';
import { DropdownMenu } from '../common/DropdownMenu';

interface Props {
  lotNumber?: string;
  onClick: (cellData: CellData) => void;
}

const sortCells = (
  dataColumns: ColumnIndexMap,
  data: QueryResultData,
  sortBy: string,
): Cell[][] => {
  return sortBy === 'wafer number'
    ? data.rows.sort((row1, row2) => row1[dataColumns.WAFER].data - row2[dataColumns.WAFER].data)
    : data.rows.sort((row1, row2) => row1[dataColumns.YIELD].data - row2[dataColumns.YIELD].data);
};

const RenderCell = React.memo(
  ({
    cellDataColumns,
    cellData,
    cellSize,
    onClick,
  }: {
    cellDataColumns: ColumnIndexMap;
    cellData: Cell[];
    cellSize: { height: number; width: number };
    onClick: (cellData: CellData) => void;
  }) => {
    const lotNumber = cellData[cellDataColumns.LOT].data;
    const waferNumber = cellData[cellDataColumns.WAFER].data;
    const waferYield = cellData[cellDataColumns.YIELD].data;

    const onCellClick = useCallback(
      () => onClick({ columns: cellDataColumns, cells: cellData }),
      [onClick, cellDataColumns, cellData],
    );

    return (
      <ExecuteQuery
        key={`binmap-${lotNumber}-${waferNumber}`}
        dataSource="Semiconductor Data"
        dimensions={[
          Semi.wafer_sort_bin_data.X_COORD,
          Semi.wafer_sort_bin_data.Y_COORD,
          Semi.wafer_sort_bin_data.BIN_NUMBER,
          Semi.wafer_sort_bin_data.LOT,
          Semi.wafer_sort_bin_data.WAFER,
          Semi.wafer_sort_bin_data.DEVICE,
          Semi.wafer_sort_yield_summary.YIELD,
          Semi.wafer_sort_bin_data.SERIAL,
        ]}
        filters={[
          filters.members(Semi.wafer_sort_bin_data.LOT, [`${lotNumber}`]),
          filters.members(Semi.wafer_sort_bin_data.WAFER, [`${waferNumber}`]),
        ]}
      >
        {(data) => {
          const waferBinData = processResult(data);

          return (
            <BinWaferMap
              key={`binmap-${lotNumber}-${waferNumber}`}
              title={`Wafer ${lotNumber}-${waferNumber}: ${waferYield}%`}
              waferBinData={waferBinData}
              height={cellSize.height}
              width={cellSize.width}
              onClick={onCellClick}
            />
          );
        }}
      </ExecuteQuery>
    );
  },
);

const RenderGallery = React.memo(
  ({
    data,
    onClick,
    sortOptions,
    sortCellsFn,
  }: {
    data: QueryResultData;
    onClick: (cellData: CellData) => void;
    sortOptions: { value: string; text: string }[];
    sortCellsFn: (dataColumns: ColumnIndexMap, data: QueryResultData, sortBy: string) => Cell[][];
  }) => {
    const dataWithRowId = useMemo(
      () => ({
        columns: [...data.columns, { name: '$cellId', type: 'string' }],
        rows: data.rows.map((row, index) => [...row, { data: `${index}` }]),
      }),
      [data],
    );
    const dataColumns = useMemo(() => getColumnIndexMap(dataWithRowId), [dataWithRowId]);
    const [cellSize] = useState({ height: 210, width: 200 });
    const [sortBy, setSortBy] = useState<string>(sortOptions[0].value);
    const sortedData = sortCellsFn(dataColumns, dataWithRowId, sortBy);
    return (
      <>
        <Toolbar>
          <DropdownMenu label={'Sort by'} onChange={setSortBy} options={sortOptions} />
        </Toolbar>
        <div
          style={{
            display: 'flex',
            flexFlow: 'row wrap',
          }}
        >
          {sortedData.map((cellData) => {
            return (
              <div
                id={`cellframe-${cellData[dataColumns.$cellId].data}`}
                key={`cellframe-${cellData[dataColumns.$cellId].data}`}
                style={{
                  height: `${cellSize.height + 2}px`,
                  width: `${cellSize.width + 2}px`,
                }}
              >
                <RenderCell
                  key={`cell${cellData[dataColumns.$cellId].data}`}
                  cellDataColumns={dataColumns}
                  cellData={cellData}
                  cellSize={cellSize}
                  onClick={onClick}
                />
              </div>
            );
          })}
        </div>
      </>
    );
  },
);

const sortOptions = [
  { value: 'wafer number', text: 'by wafer number' },
  { value: 'yield', text: 'lowest to highest yield' },
];

export const WaferMapGalleryConnected = React.memo(({ lotNumber, onClick }: Props) => {
  return (
    <ExecuteQuery
      dataSource="Semiconductor Data"
      dimensions={[
        Semi.wafer_sort_bin_data.DEVICE,
        Semi.wafer_sort_bin_data.LOT,
        Semi.wafer_sort_bin_data.WAFER,
        Semi.wafer_sort_yield_summary.YIELD,
      ]}
      filters={lotNumber ? [filters.members(Semi.wafer_sort_bin_data.LOT, [`${lotNumber}`])] : []}
    >
      {(data) => {
        if (data.rows.length === 0) return <div>{`No Results Found`}</div>;
        return (
          <RenderGallery
            data={data}
            onClick={onClick}
            sortOptions={sortOptions}
            sortCellsFn={sortCells}
          />
        );
      }}
    </ExecuteQuery>
  );
});

export type CellData = { columns: ColumnIndexMap; cells: Cell[] };
export type ColumnIndexMap = Record<string, number>;
export function getColumnIndexMap(data: QueryResultData): ColumnIndexMap {
  return data.columns.reduce<Record<string, number>>((map, el, index) => {
    map[el.name] = index;
    return map;
  }, {});
}
