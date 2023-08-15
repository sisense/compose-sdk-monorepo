/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-lines-per-function */
import React, { useMemo, useRef, useState } from 'react';
import { Runtime, Inspector } from '@observablehq/runtime';
import notebook from '@customchart/multiplehistograms';
import * as DM from '../data-model/olympics-data';
import { ExecuteQuery, MemberFilterTile } from '@sisense/sdk-ui';
import { Cell, Filter, QueryResultData } from '@sisense/sdk-data';
import { Cell as RowCell, Table, Row, TableWrapper } from '../overStyle';

export const Page16 = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  interface IndexedRow {
    [key: string]: Cell;
  }

  type IndexedRows = IndexedRow[];

  function transformData(data: QueryResultData) {
    const indexedRows: IndexedRows = [];

    const rows = data.rows;
    const columns = data.columns;

    rows.forEach((row, rowIndex) => {
      const item: IndexedRow = {};
      columns.forEach((column, colIndex) => {
        item[column.name] = rows[rowIndex][colIndex].data;
      });
      indexedRows.push(item);
    });

    return indexedRows;
  }

  const [sportFilter, setSportFilter] = useState<Filter | null>(null);
  const [sexFilter, setSexFilter] = useState<Filter | null>(null);

  // accumulate only filters with sub selection
  const activeFilters = useMemo<Filter[]>(() => {
    return [sportFilter, sexFilter].filter((f) => !!f) as Filter[];
  }, [sportFilter, sexFilter]);

  return (
    <>
      <b>
        <h1>
          {'Embedded Observable Notebook with Data queried from Sisense Instance (ElastiCube)'}
        </h1>
      </b>

      <TableWrapper>
        <Table>
          <tbody>
            <Row>
              <RowCell>
                <MemberFilterTile
                  title={'Filter by sex'}
                  dataSource={DM.DataSource}
                  attribute={DM.athletes.sex}
                  filter={sexFilter}
                  onChange={setSexFilter}
                />
                <br />
                <br />
                <MemberFilterTile
                  title={'Filter by sport'}
                  dataSource={DM.DataSource}
                  attribute={DM.athletes.sport}
                  filter={sportFilter}
                  onChange={setSportFilter}
                />
              </RowCell>
              <RowCell>
                <div ref={chartRef} />
                <p>
                  <a href="https://observablehq.com/@customchart/multiplehistograms">
                    Multiple Histograms of Athletes at Rio 2016 Summer Olympics -- Weights broken
                    down by Sex
                  </a>
                </p>

                <ExecuteQuery
                  dataSource={DM.DataSource}
                  dimensions={[DM.athletes.athletes_id, DM.athletes.sex, DM.athletes.weight]}
                  measures={[]}
                  filters={activeFilters}
                >
                  {(data) => {
                    if (data) {
                      const runtime = new Runtime();
                      const main = runtime.module(notebook, (name: string) => {
                        if (name === 'chart') return new Inspector(chartRef.current);
                      });
                      main.redefine('data', transformData(data));
                      return <div>{`Total Data Points: ${data.rows.length}`}</div>;
                    }
                  }}
                </ExecuteQuery>
              </RowCell>
            </Row>
          </tbody>
        </Table>
      </TableWrapper>
    </>
  );
};
