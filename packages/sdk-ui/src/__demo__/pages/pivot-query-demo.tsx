import React, { useState } from 'react';
import { filterFactory, measureFactory, QueryResultData } from '@sisense/sdk-data';
import { ExecutePivotQueryParams, useExecutePivotQuery } from '../../query-execution';
import * as DM from '../sample-ecommerce';
import { TableStyleOptions } from '../../types';
import { Table } from '../../table';

type FlatPivotTableProps = {
  dataSet: QueryResultData;
};

export function FlatPivotTable({ dataSet }: FlatPivotTableProps) {
  const dataOptions = {
    columns: dataSet.columns,
  };

  const styleOptions: TableStyleOptions = {
    headersColor: true,
    alternatingRowsColor: true,
    alternatingColumnsColor: false,
    rowsPerPage: 100,
  };

  return <Table dataSet={dataSet} dataOptions={dataOptions} styleOptions={styleOptions} />;
}

export function ConnectedFlatPivotTable({ queryParams }: { queryParams: ExecutePivotQueryParams }) {
  const [showCode, setShowCode] = useState(false);
  const { data, isLoading, isError } = useExecutePivotQuery(queryParams);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }

  return (
    <>
      <div style={{ display: 'flex' }}>
        <h4>Show ExecutePivotQueryParams</h4>
        <input
          type="checkbox"
          id="showCode"
          name="showCode"
          value="Show Code"
          checked={showCode}
          onChange={() => setShowCode(!showCode)}
        ></input>
      </div>
      {showCode && <pre>{JSON.stringify(queryParams, null, 2)}</pre>}
      <div>{`Total Rows: ${data.table.rows.length}`}</div>
      <FlatPivotTable dataSet={data.table} />
    </>
  );
}

export function PivotQueryDemo() {
  const queryParamsSimple: ExecutePivotQueryParams = {
    dataSource: DM.DataSource,
    rows: [DM.Commerce.AgeRange],
    columns: [{ attribute: DM.Commerce.Gender, includeSubTotals: true }],
    values: [measureFactory.sum(DM.Commerce.Cost, 'Total Cost')],
  };

  const queryParamsMedium: ExecutePivotQueryParams = {
    dataSource: DM.DataSource,
    rows: [
      { attribute: DM.Category.Category, includeSubTotals: true },
      { attribute: DM.Commerce.AgeRange, includeSubTotals: true },
      DM.Commerce.Condition,
    ],
    columns: [{ attribute: DM.Commerce.Gender, includeSubTotals: true }],
    values: [
      {
        measure: measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
        totalsCalculation: 'min',
      },
    ],
    grandTotals: { title: 'Grand Total', rows: true, columns: true },
    filters: [filterFactory.members(DM.Commerce.Gender, ['Female', 'Male'])],
  };

  const queryParamsComplex: ExecutePivotQueryParams = {
    dataSource: DM.DataSource,
    rows: [
      { attribute: DM.Category.Category, includeSubTotals: true },
      { attribute: DM.Brand.Brand, includeSubTotals: true },
      DM.Commerce.Condition,
    ],
    columns: [
      { attribute: DM.Commerce.Gender, includeSubTotals: true },
      { attribute: DM.Commerce.AgeRange, includeSubTotals: true },
    ],
    values: [
      {
        measure: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
        totalsCalculation: 'sum',
      },
      {
        measure: measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity'),
        totalsCalculation: 'min',
      },
    ],
    grandTotals: { title: 'Grand Total', rows: true, columns: true },
    filters: [filterFactory.members(DM.Commerce.Gender, ['Female', 'Male'])],
  };

  return (
    <>
      <h1>useExecutePivotQuery</h1>
      <ConnectedFlatPivotTable queryParams={queryParamsSimple} />
      <ConnectedFlatPivotTable queryParams={queryParamsMedium} />
      <ConnectedFlatPivotTable queryParams={queryParamsComplex} />
    </>
  );
}
