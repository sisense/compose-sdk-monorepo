/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCallback, useMemo, useState } from 'react';
import { CartesianChartDataOptions, Chart, DataPoint, MemberFilterTile } from '../../index';
import * as DM from '../sample-ecommerce';
import { filterFactory, Filter, measureFactory, MembersFilter } from '@sisense/sdk-data';

export const PageCrossFiltering = () => {
  const [yearFilter, setYearFilter] = useState<Filter | null>(
    filterFactory.members(DM.Commerce.Date.Years, ['2010-01-01T00:00:00']),
  );
  const [genderFilter, setGenderFilter] = useState<Filter | null>(null);

  const yearFilterOnSelect = useCallback((value: string | string[]) => {
    if (!value) {
      setYearFilter(null);
      return;
    }
    const members = typeof value === 'string' ? [value] : value;
    setYearFilter(filterFactory.members(DM.Commerce.Date.Years, members));
  }, []);

  // accumulate only filters with sub selection
  const activeFilters = useMemo<Filter[]>(() => {
    return [yearFilter, genderFilter, filterFactory.greaterThan(DM.Commerce.Revenue, 0)].filter(
      (f) => !!f,
    ) as Filter[];
  }, [yearFilter, genderFilter]);

  const dataOptions: CartesianChartDataOptions = {
    category: [DM.Commerce.Date.Years],
    value: [measureFactory.sum(DM.Commerce.Revenue)],
    breakBy: [DM.Commerce.AgeRange],
  };

  return (
    <>
      <br />
      <h1>
        <b>{'Cross Chart Highlighting and Filtering with ComposeSDK Filter Component'}</b>
      </h1>
      <button
        onClick={() =>
          setYearFilter(
            filterFactory.members(DM.Commerce.Date.Years, [
              '2009-01-01T00:00:00',
              '2010-01-01T00:00:00',
            ]),
          )
        }
      >
        {`Set Filter to 2009 and 2010`}
      </button>
      <button onClick={() => setYearFilter(filterFactory.members(DM.Commerce.Date.Years, []))}>
        {'Clear Filter'}
      </button>
      <br />
      <br />
      {`Filter Members: ${(yearFilter as MembersFilter).members}`}
      <br />
      <h2>{'Clicking chart data also changes filter'}</h2>
      <br />
      <h2>{'Filters'}</h2>
      <div className="csdk-flex">
        <MemberFilterTile
          title={'Filter by year'}
          attribute={DM.Commerce.Date.Years}
          filter={yearFilter}
          onChange={setYearFilter}
        />
        <MemberFilterTile
          title={'Gender'}
          attribute={DM.Commerce.Gender}
          filter={genderFilter}
          onChange={setGenderFilter}
        />
      </div>
      <div className="csdk-flex">
        <div className="csdk-flex csdk-flex-col">
          <div style={{ width: '40vw' }}>{'Highlight Filter'}</div>
          <Chart
            chartType={'column'}
            dataSet={DM.DataSource}
            filters={[]}
            highlights={activeFilters}
            dataOptions={dataOptions}
            onDataPointClick={(point: DataPoint) => {
              yearFilterOnSelect(`${point.categoryValue}`);
            }}
            onDataPointsSelected={(points: DataPoint[]) => {
              yearFilterOnSelect(points.map((point) => `${point.categoryValue}`));
            }}
          />
        </div>
        <div className="csdk-flex csdk-flex-col">
          <div style={{ width: '40vw' }}>{'Slice Filter'}</div>
          <Chart
            chartType={'column'}
            dataSet={DM.DataSource}
            filters={activeFilters}
            dataOptions={dataOptions}
            onDataPointClick={(point: DataPoint) => {
              yearFilterOnSelect(`${point.categoryValue}`);
            }}
          />
        </div>
      </div>
    </>
  );
};
