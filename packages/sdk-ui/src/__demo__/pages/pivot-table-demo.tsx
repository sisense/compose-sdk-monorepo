import React from 'react';
import { PivotTable } from '@/pivot-table';
import * as DM from '../sample-ecommerce';
import { filterFactory, measureFactory } from '@sisense/sdk-data';

export function PivotTableDemo() {
  return (
    <>
      <div style={{ width: 1100 }}>
        <PivotTable
          dataSet={DM.DataSource}
          dataOptions={{
            rows: [
              {
                column: DM.Category.Category,
                includeSubTotals: true,
                sortType: {
                  direction: 'sortDesc',
                  by: { valuesIndex: 0, columnsMembersPath: ['Female'] },
                },
              },
              {
                column: DM.Commerce.AgeRange,
                includeSubTotals: true,
                sortType: { direction: 'sortAsc' },
              },
              DM.Commerce.Condition,
            ],
            columns: [{ column: DM.Commerce.Gender, includeSubTotals: true }],
            values: [
              {
                column: measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
                dataBars: true,
                totalsCalculation: 'sum',
              },
              {
                column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
                totalsCalculation: 'sum',
              },
            ],
            grandTotals: { title: 'Grand Total', rows: true, columns: true },
          }}
          filters={[filterFactory.members(DM.Commerce.Gender, ['Female', 'Male'])]}
          styleOptions={{ width: 1000, height: 600, rowsPerPage: 50 }}
        />
      </div>

      <PivotTable
        dataSet={DM.DataSource}
        dataOptions={{
          rows: [DM.Commerce.AgeRange],
          columns: [{ column: DM.Commerce.Gender, includeSubTotals: true }],
          values: [measureFactory.sum(DM.Commerce.Cost, 'Total Cost')],
        }}
        styleOptions={{ width: 800, isAutoHeight: true, rowsPerPage: 10 }}
      />

      {/*<PivotTable*/}
      {/*  dataSet={DM.DataSource}*/}
      {/*  dataOptions={{*/}
      {/*    rows: [*/}
      {/*      { column: DM.Category.Category, includeSubTotals: true },*/}
      {/*      { column: DM.Brand.Brand, includeSubTotals: true },*/}
      {/*      DM.Commerce.Condition,*/}
      {/*    ],*/}
      {/*    columns: [*/}
      {/*      { column: DM.Commerce.Gender, includeSubTotals: true },*/}
      {/*      { column: DM.Commerce.AgeRange, includeSubTotals: true },*/}
      {/*    ],*/}
      {/*    values: [*/}
      {/*      {*/}
      {/*        column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),*/}
      {/*        totalsCalculation: 'sum',*/}
      {/*      },*/}
      {/*      {*/}
      {/*        column: measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity'),*/}
      {/*        totalsCalculation: 'min',*/}
      {/*      },*/}
      {/*    ],*/}
      {/*    grandTotals: { title: 'Grand Total', rows: true, columns: true },*/}
      {/*  }}*/}
      {/*  filters={[filterFactory.members(DM.Commerce.Gender, ['Female', 'Male'])]}*/}
      {/*  styleOptions={{ width: 1400, height: 1200, rowsPerPage: 75 }}*/}
      {/*/>*/}
    </>
  );
}
