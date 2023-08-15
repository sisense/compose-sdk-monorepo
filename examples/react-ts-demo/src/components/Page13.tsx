/* eslint-disable max-lines-per-function */
import { useCallback, useMemo, useState } from 'react';
import { Chart, ScatterStyleOptions, MemberFilterTile } from '@sisense/sdk-ui';
import * as DM from '../data-model/sample-ecommerce';
import { filters, Filter, measures } from '@sisense/sdk-data';
import type { ScatterChartDataOptions } from '@sisense/sdk-ui';
import { Cell, Table, Row, TableWrapper } from '../overStyle';

export const Page13 = () => {
  const [yearFilter, setYearFilter] = useState<Filter | null>(null);
  const [genderFilter, setGenderFilter] = useState<Filter | null>(null);

  const yearFilterOnClick = useCallback((text: string | null) => {
    if (!text) {
      setYearFilter(null);
      return;
    }
    setYearFilter(filters.members(DM.Commerce.Date.Years, [text]));
  }, []);

  // accumulate only filters with sub selection
  const activeFilters = useMemo<Filter[]>(() => {
    return [yearFilter, genderFilter, filters.greaterThan(DM.Commerce.Revenue, 0)].filter(
      (f) => !!f,
    ) as Filter[];
  }, [yearFilter, genderFilter]);

  const measureRevenue = measures.sum(DM.Commerce.Revenue);
  const measureQuantity = measures.sum(DM.Commerce.Quantity);
  const measureCost = measures.sum(DM.Commerce.Cost);

  const scatterChartDataOptions: ScatterChartDataOptions = useMemo(() => {
    const seriesToColorMap = {
      Female: '#00cee6',
      Male: '#9b9bd7',
      Unspecified: '#6eda55',
    };
    return {
      x: measureRevenue,
      y: measureQuantity,
      breakByPoint: DM.Category.Category,
      breakByColor: DM.Commerce.Gender,
      size: measureCost,
      seriesToColorMap,
    };
  }, [measureRevenue, measureQuantity, measureCost]);

  const styleOptions: ScatterStyleOptions = {
    xAxis: {
      logarithmic: true,
    },
    yAxis: {
      logarithmic: true,
    },
  };

  return (
    <>
      <br />
      <h1>
        <b>{'Scatter Chart Examples'}</b>
      </h1>
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
      <div style={{ width: '80vw' }}>
        <div style={{ margin: '10px', width: '40vw' }}>
          {'TOP CATEGORIES BY REVENUE, UNITS SOLD, AND GENDER'}
        </div>
        <Chart
          chartType={'scatter'}
          dataSet={DM.DataSource}
          filters={activeFilters}
          dataOptions={scatterChartDataOptions}
          styleOptions={styleOptions}
          onDataPointClick={(point) => {
            yearFilterOnClick(`${point.categoryValue}`);
          }}
        />
      </div>
      <br></br>
      <div style={{ width: '80vw' }}>
        <div style={{ margin: '10px', width: '40vw' }}>
          {'UNITS SOLD BY DATE, BRAND AND COUNTRY'}
        </div>
        <Chart
          chartType={'scatter'}
          dataSet={DM.DataSource}
          filters={activeFilters}
          dataOptions={{
            x: measureQuantity,
            y: DM.Commerce.Date.Years,
            breakByPoint: DM.Brand.Brand,
            breakByColor: DM.Country.Country,
            size: measureCost,
          }}
          styleOptions={{
            ...styleOptions,
            yAxis: { ...styleOptions.yAxis!, logarithmic: false },
          }}
          onDataPointClick={(point) => {
            yearFilterOnClick(`${point.categoryValue}`);
          }}
        />
      </div>
    </>
  );
};
