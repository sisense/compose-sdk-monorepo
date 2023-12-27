/* eslint-disable max-lines */
import { measureFactory, filterFactory, QueryResultData } from '@sisense/sdk-data';
import * as DM from '../sample-ecommerce';
import { useCallback, useRef, useState } from 'react';
import { useExecuteQuery, useExecuteQueryByWidgetId } from '../../query-execution';
import { Chart } from '../../chart';
import { Card, CardContent, CardHeader } from '@mui/material';
import styled from '@emotion/styled';
import { useWidgetFromSampleEcommerceDashboard } from './helpers/use-widget-from-sample-ecommerce-dashboard';
import { ChartDataOptions, ChartType } from '../../types';

const DATE_LEVEL_YEARS = 'Years';
const DATE_LEVEL_MONTHS = 'Months';

export const UseExecuteQueryDemo = () => {
  return (
    <div style={{ margin: 20 }}>
      <DemoCard>
        <CardContent>
          <CardHeader title="useExecuteQuery + Chart" />
          <ChartWithDataQueriedByHook />
        </CardContent>
      </DemoCard>
      <DemoCard>
        <CardContent>
          <CardHeader title="useExecuteQueryByWidgetId + Chart" />
          <ChartWithDataQueriedByWidgetId />
        </CardContent>
      </DemoCard>
    </div>
  );
};

const DemoCard = styled(Card)(() => ({
  marginTop: 20,
}));

export const ChartWithDataQueriedByHook = () => {
  // When date grouping state is changed, it triggers a re-render including the execution of the useExecuteQuery hook
  // However, the query is executed asynchronously so when the Chart is re-rendered, the data is not yet available
  // and thus out of sync with the data grouping state. To work around this, we use a ref to store the date grouping
  // synced with the data and use it to render the chart. This allows the chart to stay on screen while the data is (re)loading.
  const [dateGroupingState, setDateGroupingState] = useState(DATE_LEVEL_YEARS);
  const dateGroupingData = useRef(DATE_LEVEL_YEARS);

  const onBeforeQuery = useCallback((jaql: any) => {
    return { ...jaql, queryGuid: 'compose-sdk-is-cool' };
  }, []);

  const { data, isLoading, isError } = useExecuteQuery({
    dataSource: DM.DataSource,
    dimensions: [DM.Commerce.Date[dateGroupingState]],
    measures: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
    filters: [filterFactory.greaterThan(DM.Commerce.Revenue, 1000)],
    onBeforeQuery,
  });

  if (!isLoading && data) {
    dateGroupingData.current = dateGroupingState;
  }

  return (
    <>
      <div className="csdk-flex">
        <button
          disabled={dateGroupingState === DATE_LEVEL_YEARS}
          onClick={() => setDateGroupingState(DATE_LEVEL_YEARS)}
        >
          Years
        </button>
        <button
          disabled={dateGroupingState === DATE_LEVEL_MONTHS}
          onClick={() => setDateGroupingState(DATE_LEVEL_MONTHS)}
        >
          Months
        </button>
        {isLoading && <div>Loading...</div>}
        {isError && <div>Error</div>}
      </div>
      {data && (
        <div>
          <Chart
            chartType="column"
            dataSet={data}
            dataOptions={{
              category: [{ name: dateGroupingData.current, type: 'datetime' }],
              value: [{ name: 'Total Revenue' }],
              breakBy: [],
            }}
          />
        </div>
      )}
    </>
  );
};

enum SampleEcommerceWidgetTitle {
  GENDER_BREAKDOWN = 'GENDER BREAKDOWN',
  REVENUE_VS_UNITS_SOLD = 'REVENUE vs.UNITS SOLD',
}

type ChartOptions = {
  chartType: ChartType;
  dataOptions: ChartDataOptions;
};

const chartOptionsPerWidgetTitle: Record<SampleEcommerceWidgetTitle, ChartOptions> = {
  [SampleEcommerceWidgetTitle.GENDER_BREAKDOWN]: {
    dataOptions: {
      category: [DM.Commerce.Gender],
      value: [{ name: 'Total Revenue' }],
    },
    chartType: 'pie',
  },
  [SampleEcommerceWidgetTitle.REVENUE_VS_UNITS_SOLD]: {
    chartType: 'line',
    dataOptions: {
      category: [{ name: 'MonthsinDate', type: 'datetime' }],
      value: [
        DM.Measures.SumRevenue,
        {
          column: DM.Measures.Quantity,
          showOnRightAxis: true,
          chartType: 'column',
        },
      ],
      breakBy: [],
    },
  },
};

const generateNextGuid = (() => {
  let i = 0;
  return () => `csdk-guid-${i++}`;
})();

export const ChartWithDataQueriedByWidgetId = () => {
  const [activeWidgetTitle, setActiveWidgetTitle] = useState<SampleEcommerceWidgetTitle>(
    SampleEcommerceWidgetTitle.GENDER_BREAKDOWN,
  );
  const [onBeforeQuery, setOnBeforeQuery] = useState<(jaql: any) => any>(() => (jaql: any) => {
    return {
      ...jaql,
      queryGuid: generateNextGuid(),
    };
  });
  const {
    widgetOid,
    widgetTitle,
    dashboardOid,
    dashboardTitle,
    isSearchingForWidget,
    error: widgetError,
  } = useWidgetFromSampleEcommerceDashboard(activeWidgetTitle);

  const { data, isLoading } = useExecuteQueryByWidgetId({
    widgetOid: widgetOid || '',
    dashboardOid: dashboardOid || '',
    enabled: !!widgetOid,
    onBeforeQuery,
  });

  return (
    <div>
      <div>
        <button
          onClick={() => setActiveWidgetTitle(SampleEcommerceWidgetTitle.GENDER_BREAKDOWN)}
          disabled={activeWidgetTitle === SampleEcommerceWidgetTitle.GENDER_BREAKDOWN}
        >
          {SampleEcommerceWidgetTitle.GENDER_BREAKDOWN}
        </button>
        <button
          onClick={() => setActiveWidgetTitle(SampleEcommerceWidgetTitle.REVENUE_VS_UNITS_SOLD)}
          disabled={activeWidgetTitle === SampleEcommerceWidgetTitle.REVENUE_VS_UNITS_SOLD}
        >
          {SampleEcommerceWidgetTitle.REVENUE_VS_UNITS_SOLD}
        </button>
      </div>

      {isSearchingForWidget && <div>Searching for widget 'GENDER BREAKDOWN' ...</div>}
      {widgetOid && (
        <span>
          Widget {`'${widgetTitle}' (${widgetOid})`} of dashboard
          {` '${dashboardTitle}' (${dashboardOid})`} from your Sisense instance
        </span>
      )}
      {widgetOid && isLoading && <div>Loading data...</div>}
      {widgetError && (
        <span>
          Loading widget error <span style={{ color: 'red' }}>{widgetError.message}</span>
        </span>
      )}
      {data && isDataForWidget(data, activeWidgetTitle) && (
        <Chart dataSet={data} {...chartOptionsPerWidgetTitle[activeWidgetTitle]} />
      )}
      <button
        onClick={() =>
          setOnBeforeQuery(() => (jaql: any) => ({ ...jaql, queryGuid: 'compose-sdk-is-cool' }))
        }
      >
        Set 'queryGuid' for each JAQL to 'compose-sdk-is-cool'
      </button>
    </div>
  );
};

function isDataForWidget(data: QueryResultData, widgetTitle: SampleEcommerceWidgetTitle) {
  switch (widgetTitle) {
    case SampleEcommerceWidgetTitle.GENDER_BREAKDOWN:
      return (
        data.columns.some((column) => column.name === 'Gender') &&
        data.columns.some((column) => column.name === 'Total Revenue')
      );
    case SampleEcommerceWidgetTitle.REVENUE_VS_UNITS_SOLD:
      return (
        data.columns.some((column) => column.name === 'Total Revenue') &&
        data.columns.some((column) => column.name === 'Total Quantity')
      );
    default:
      return false;
  }
}
