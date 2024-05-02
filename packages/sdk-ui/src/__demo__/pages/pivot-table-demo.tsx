import React from 'react';
import { PivotTable } from '@/pivot-table';
import * as DM from '../sample-ecommerce';
import { filterFactory, measureFactory } from '@sisense/sdk-data';
import { PivotTableWidget } from '@/widgets/pivot-table-widget';

export function PivotTableDemo() {
  return (
    <>
      <div style={{ marginBottom: '60px' }}>
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
          styleOptions={{
            width: 1000,
            height: 600,
            rowsPerPage: 50,
            alternatingRowsColor: true,
            totalsColor: true,
          }}
        />
      </div>
      <PivotTableWidget
        dataSource={DM.DataSource}
        dataOptions={{
          rows: [DM.Commerce.AgeRange],
          columns: [{ column: DM.Commerce.Gender, includeSubTotals: true }],
          values: [measureFactory.sum(DM.Commerce.Cost, 'Total Cost')],
        }}
        styleOptions={{
          width: 800,
          isAutoHeight: true,
          rowsPerPage: 10,
          rowHeight: 40,
          membersColor: true,
          headersColor: true,
          border: true,
          borderColor: 'lightgrey',
        }}
        title={'Pivot table widget'}
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
