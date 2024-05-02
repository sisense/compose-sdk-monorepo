import { useMemo, useState } from 'react';
import {
  LineStyleOptions,
  IndicatorStyleOptions,
  NumberFormatConfig,
  IndicatorChart,
  ScatterStyleOptions,
  StackableStyleOptions,
  MemberFilterTile,
  ChartWidget,
  DataPointEventHandler,
} from '../../index';
import * as DM from '../sample-ecommerce';
import { Filter, filterFactory, measureFactory } from '@sisense/sdk-data';

const seriesToColorMap = {
  Female: '#00cee6',
  Male: '#9b9bd7',
  Unspecified: '#6eda55',
};

export const getIndicatorStyleOptions = (
  title: string,
  secondaryTitle = '',
): IndicatorStyleOptions => {
  return {
    indicatorComponents: {
      title: {
        shouldBeShown: true,
        text: title,
      },
      secondaryTitle: {
        text: secondaryTitle,
      },
      ticks: {
        shouldBeShown: true,
      },
      labels: {
        shouldBeShown: true,
      },
    },
    subtype: 'indicator/gauge',
    skin: 1,
  };
};

const scatterStyleOptions: ScatterStyleOptions = {
  xAxis: {
    logarithmic: true,
  },
  yAxis: {
    logarithmic: true,
  },
};

const barStyleOptions: StackableStyleOptions = {
  subtype: 'bar/stacked',
};

const numberFormat: NumberFormatConfig = {
  name: 'Numbers',
  decimalScale: 2,
  trillion: true,
  billion: true,
  million: true,
  kilo: true,
  thousandSeparator: true,
  prefix: false,
  symbol: '$',
};

const lineChartStyleOptions: LineStyleOptions = {
  subtype: 'line/spline',
  lineWidth: { width: 'bold' },
  yAxis: {
    title: { enabled: true, text: 'SALES' },
  },
  y2Axis: {
    title: { enabled: true, text: 'QUANTITY' },
  },
  markers: {
    enabled: true,
    fill: 'hollow',
  },
};

export const ECommerceDemo = () => {
  const [yearFilter, setYearFilter] = useState<Filter | null>(
    filterFactory.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00']),
  );
  const [countryFilter, setCountryFilter] = useState<Filter | null>(null);
  const [quantityFilter, setQuantityFilter] = useState<Filter | null>(null);

  // accumulate only filters with sub selection
  const activeFilters = useMemo<Filter[]>(() => {
    return [
      yearFilter,
      countryFilter,
      quantityFilter,
      filterFactory.greaterThan(DM.Commerce.Revenue, 0),
    ].filter((f) => !!f) as Filter[];
  }, [yearFilter, countryFilter, quantityFilter]);

  const pieActiveFilters = useMemo<Filter[]>(() => {
    return [...activeFilters, filterFactory.members(DM.Commerce.Gender, ['Male', 'Female'])].filter(
      (f) => !!f,
    );
  }, [activeFilters]);

  const scatterActiveFilters = useMemo<Filter[]>(() => {
    return [
      ...activeFilters,
      filterFactory.members(DM.Commerce.Gender, ['Male', 'Female']),
      filterFactory.topRanking(DM.Category.Category, DM.Measures.SumRevenue, 10),
    ].filter((f) => !!f);
  }, [activeFilters]);

  const barActiveFilters = useMemo<Filter[]>(() => {
    return [
      ...activeFilters,
      filterFactory.topRanking(DM.Category.Category, DM.Measures.SumRevenue, 3),
    ].filter((f) => !!f);
  }, [activeFilters]);

  return (
    <div className="csdk-flex csdk-w-full csdk-justify-center">
      <div className="csdk-flex csdk-flex-col">
        <div className="csdk-w-full csdk-my-4">
          <b>
            <h1>
              Dashboard Implemented In Code:
              <a style={{ alignContent: 'center', color: 'blue' }} target="_new">
                {'  Sample E-Commerce'}
              </a>
            </h1>
          </b>
        </div>
        <div className="csdk-flex csdk-flex-row csdk-h-[850px]">
          <div className="csdk-flex csdk-flex-col csdk-w-48">
            <div className={'csdk-flex-1 csdk-border csdk-border-lightgray csdk-w-full'}>
              <IndicatorChart
                dataOptions={{
                  value: [
                    {
                      column: DM.Measures.SumRevenue,
                      numberFormatConfig: numberFormat,
                    },
                  ],
                  secondary: [],
                  min: [measureFactory.constant(0)],
                  max: [measureFactory.constant(125000000)],
                }}
                filters={activeFilters}
                styleOptions={getIndicatorStyleOptions('Total Revenue')}
              />
            </div>

            <div className={'csdk-border csdk-border-lightgray csdk-flex-1 csdk-w-full'}>
              <IndicatorChart
                dataOptions={{
                  value: [DM.Measures.Quantity],
                  secondary: [],
                  min: [measureFactory.constant(0)],
                  max: [measureFactory.constant(250000)],
                }}
                filters={activeFilters}
                styleOptions={getIndicatorStyleOptions('Total Units Sold')}
              />
            </div>

            <div className={'csdk-border csdk-flex-1 csdk-border-lightgray csdk-w-full'}>
              <IndicatorChart
                dataOptions={{
                  value: [measureFactory.countDistinct(DM.Commerce.VisitID)],
                  secondary: [],
                  min: [measureFactory.constant(0)],
                  max: [measureFactory.constant(100000)],
                }}
                filters={activeFilters}
                styleOptions={getIndicatorStyleOptions('Total Sales')}
              />
            </div>

            <div className={'csdk-border csdk-border-lightgray csdk-flex-1 csdk-w-full'}>
              <IndicatorChart
                dataOptions={{
                  value: [measureFactory.countDistinct(DM.Brand.BrandID)],
                  secondary: [],
                  min: [measureFactory.constant(0)],
                  max: [measureFactory.constant(2500)],
                }}
                filters={activeFilters}
                styleOptions={getIndicatorStyleOptions('Total Brands')}
              />
            </div>
          </div>
          <div className="csdk-flex csdk-flex-col csdk-w-[450px]">
            <div className="csdk-flex csdk-flex-1 csdk-w-full csdk-border csdk-border-gray-200 csdk-h-1/2">
              <ChartWidget
                title={'REVENUE vs.UNITS SOLD'}
                dataSource={DM.DataSource}
                chartType={'line'}
                filters={activeFilters}
                dataOptions={{
                  category: [
                    {
                      column: DM.Commerce.Date.Months,
                      dateFormat: 'yy-MM',
                    },
                  ],
                  value: [
                    DM.Measures.SumRevenue,
                    {
                      column: DM.Measures.Quantity,
                      showOnRightAxis: true,
                      chartType: 'column',
                    },
                  ],
                  breakBy: [],
                }}
                styleOptions={lineChartStyleOptions}
                onDataPointClick={
                  ((...args) => {
                    console.log('onDataPointClick', ...args);
                  }) as DataPointEventHandler
                }
              />
            </div>
            <div className="csdk-flex csdk-flex-row csdk-flex-1 csdk-h-1/2">
              <div className="csdk-flex csdk-flex-1 csdk-w-full csdk-border csdk-border-gray-200">
                <ChartWidget
                  title={'GENDER BREAKDOWN'}
                  chartType={'pie'}
                  dataSource={DM.DataSource}
                  filters={pieActiveFilters}
                  dataOptions={{
                    category: [DM.Commerce.Gender],
                    value: [DM.Measures.SumRevenue],
                  }}
                  styleOptions={scatterStyleOptions}
                />
              </div>

              <div className="csdk-flex csdk-flex-1 csdk-w-full csdk-border csdk-border-gray-200">
                <ChartWidget
                  title={'AGE RANGE BREAKDOWN'}
                  chartType={'pie'}
                  dataSource={DM.DataSource}
                  filters={pieActiveFilters}
                  dataOptions={{
                    category: [DM.Commerce.AgeRange],
                    value: [DM.Measures.SumRevenue],
                  }}
                  styleOptions={scatterStyleOptions}
                />
              </div>
            </div>
          </div>
          <div className="csdk-flex csdk-flex-col csdk-w-[480px]">
            <div className="csdk-flex csdk-flex-1 csdk-w-full csdk-border csdk-border-gray-200 csdk-h-1/2">
              <ChartWidget
                title={'TOP CATEGORIES BY REVENUE, UNITS SOLD AND GENDER'}
                chartType={'scatter'}
                dataSource={DM.DataSource}
                filters={scatterActiveFilters}
                dataOptions={{
                  x: DM.Measures.SumRevenue,
                  y: DM.Measures.Quantity,
                  breakByPoint: DM.Category.Category,
                  breakByColor: DM.Commerce.Gender,
                  size: DM.Measures.SumCost,
                  seriesToColorMap,
                }}
                styleOptions={scatterStyleOptions}
              />
            </div>
            <div className="csdk-flex csdk-flex-1 csdk-w-full csdk-border csdk-border-gray-200 csdk-h-1/2">
              <ChartWidget
                title={'TOP 3 CATEGORIES BY REVENUE AND AGE'}
                chartType={'bar'}
                dataSource={DM.DataSource}
                filters={barActiveFilters}
                dataOptions={{
                  category: [DM.Commerce.AgeRange],
                  value: [DM.Measures.SumRevenue],
                  breakBy: [DM.Category.Category],
                }}
                styleOptions={barStyleOptions}
              />
            </div>
          </div>
          <div className="csdk-bg-gray-200 csdk-h-full">
            <p className="csdk-m-3 csdk-text-sm csdk-font-sans csdk-font-medium">Filters</p>
            <hr className="csdk-border-t csdk-border-gray-400 csdk-m-2" />
            <div className="csdk-flex csdk-flex-col csdk-bg-white m-2">
              <MemberFilterTile
                title={'Year'}
                attribute={DM.Commerce.Date.Years}
                filter={yearFilter}
                onChange={setYearFilter}
              />

              <MemberFilterTile
                title={'Country'}
                attribute={DM.Country.Country}
                filter={countryFilter}
                onChange={setCountryFilter}
              />

              <MemberFilterTile
                title={'Quantity'}
                attribute={DM.Commerce.Quantity}
                filter={quantityFilter}
                onChange={setQuantityFilter}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
