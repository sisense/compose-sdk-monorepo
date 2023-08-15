/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-lines-per-function */
import { useCallback, useMemo, useState } from 'react';
import { Chart, MemberFilterTile } from '@sisense/sdk-ui';
import * as DM from '../data-model/sample-ecommerce';
import { filters, Column, Filter, measures } from '@sisense/sdk-data';
import type { CartesianChartDataOptions, StyledColumn } from '@sisense/sdk-ui';
import { useDateLevelToolbar, useDateFormatInput } from './hooks';
import { Cell, Table, Row, TableWrapper } from '../overStyle';

export const PageCrossFiltering = () => {
  const { activeLevel: dateLevelForX } = useDateLevelToolbar();
  const { dateFormat: dateFormatForX } = useDateFormatInput();

  const [yearFilter, setYearFilter] = useState<Filter | null>(null);
  const [genderFilter, setGenderFilter] = useState<Filter | null>(null);

  const yearFilterOnSelect = useCallback((value: string | string[]) => {
    if (!value) {
      setYearFilter(null);
      return;
    }
    const members = typeof value === 'string' ? [value] : value;
    setYearFilter(filters.members(DM.Commerce.Date.Years, members));
  }, []);

  // accumulate only filters with sub selection
  const activeFilters = useMemo<Filter[]>(() => {
    return [yearFilter, genderFilter, filters.greaterThan(DM.Commerce.Revenue, 0)].filter(
      (f) => !!f,
    ) as Filter[];
  }, [yearFilter, genderFilter]);

  const xDateLevelAttribute: StyledColumn = useMemo(() => {
    const xDateLevel: Column = DM.Commerce.Date[dateLevelForX];
    return {
      // name: xDateLevel.name,
      // type: xDateLevel.type,
      column: xDateLevel,
      dateFormat: dateFormatForX,
    };
  }, [dateLevelForX, dateFormatForX]);

  const measure = measures.sum(DM.Commerce.Revenue);

  const dataOptions: CartesianChartDataOptions = useMemo(() => {
    return {
      category: [xDateLevelAttribute],
      value: [measure],
      breakBy: [DM.Commerce.AgeRange],
    };
  }, [xDateLevelAttribute, measure]);

  return (
    <>
      <br />
      <h1>
        <b>{'Cross Chart Highlighting and Filtering with ComposeSDK Filter Component'}</b>
      </h1>
      <br />
      <h2>{'Clicking chart data also changes filter'}</h2>
      <br />
      <h2>{'Filters'}</h2>
      <TableWrapper>
        <Table>
          <tbody>
            <Row>
              <Cell>
                <MemberFilterTile
                  title={'Filter by year'}
                  attribute={DM.Commerce.Date.Years}
                  filter={yearFilter}
                  onChange={setYearFilter}
                />
              </Cell>
              <Cell>
                <MemberFilterTile
                  title={'Gender'}
                  attribute={DM.Commerce.Gender}
                  filter={genderFilter}
                  onChange={setGenderFilter}
                />
              </Cell>
            </Row>
          </tbody>
        </Table>
      </TableWrapper>
      <br></br>
      <TableWrapper>
        <Table>
          <tbody>
            <Row>
              <Cell>
                <div style={{ width: '40vw' }}>{'Highlight Filter'}</div>
                <Chart
                  chartType={'column'}
                  dataSet={DM.DataSource}
                  filters={[]}
                  highlights={activeFilters}
                  dataOptions={dataOptions}
                  onDataPointClick={(point) => {
                    yearFilterOnSelect(`${point.categoryValue}`);
                  }}
                  onDataPointsSelected={(points) => {
                    yearFilterOnSelect(points.map((point) => `${point.categoryValue}`));
                  }}
                />
              </Cell>
              <Cell>
                <div style={{ width: '40vw' }}>{'Slice Filter'}</div>
                <Chart
                  chartType={'column'}
                  dataSet={DM.DataSource}
                  filters={activeFilters}
                  dataOptions={dataOptions}
                  onDataPointClick={(point) => {
                    yearFilterOnSelect(`${point.categoryValue}`);
                  }}
                />
              </Cell>
            </Row>
          </tbody>
        </Table>
      </TableWrapper>
    </>
  );
};
