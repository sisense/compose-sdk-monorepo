import * as DM from '../sample-ecommerce.js';
import { Filter, filterFactory, analyticsFactory } from '@sisense/sdk-data';
import { BoxplotStyleOptions } from '../../types.js';
import { ExecuteQuery } from '../../query-execution/index.js';
import {
  BoxplotChartCustomDataOptions,
  BoxplotChartDataOptions,
} from '../../chart-data-options/types.js';
import { boxWhiskerProcessResult } from '../../boxplot-utils.js';
import { BoxplotChart } from '../../boxplot-chart.js';

const dataOptions: BoxplotChartDataOptions | BoxplotChartCustomDataOptions = {
  category: [DM.Category.Category],
  value: [DM.Commerce.Cost],
  boxType: 'iqr',
  outliersEnabled: true,
};
const filters: Filter[] = [
  filterFactory.members(DM.Category.Category, [
    'Apple Mac Desktops',
    'Apple Mac Laptops',
    'Calculators',
  ]),
];
const styleOptions: BoxplotStyleOptions = {
  subtype: 'boxplot/full',
  xAxis: {
    enabled: true,
    gridLines: true,
    labels: {
      enabled: true,
    },
    title: {
      enabled: true,
      text: 'Categories',
    },
  },
  yAxis: {
    enabled: true,
    gridLines: true,
    labels: {
      enabled: true,
    },
    title: {
      enabled: true,
      text: 'Cost',
    },
    isIntervalEnabled: true,
  },
  legend: {
    enabled: true,
    position: 'bottom',
  },
  seriesLabels: {
    enabled: true,
  },
  navigator: {
    enabled: true,
  },
};

export const BoxplotChartDemo: React.FC = () => {
  return (
    <>
      <h2>Boxplot Chart</h2>
      <BoxplotChart
        dataSet={DM.DataSource}
        filters={filters}
        dataOptions={dataOptions}
        styleOptions={styleOptions}
      />
      <h2>Boxplot Chart with custom data (loaded via ExecuteQuery)</h2>
      <ExecuteQuery
        dataSource={DM.DataSource}
        dimensions={[DM.Category.Category]}
        measures={analyticsFactory.boxWhiskerIqrValues(DM.Commerce.Cost)}
        filters={filters}
      >
        {({ data: boxWhiskerData }) => (
          <ExecuteQuery
            dataSource={DM.DataSource}
            dimensions={[
              DM.Category.Category,
              analyticsFactory.boxWhiskerIqrOutliers(DM.Commerce.Cost),
            ]}
            measures={[]}
            filters={filters}
          >
            {({ data: outliersData }) => {
              if (!boxWhiskerData || !outliersData) return null;

              const data = boxWhiskerProcessResult(boxWhiskerData, outliersData);

              return (
                <BoxplotChart
                  dataSet={data}
                  filters={filters}
                  dataOptions={{
                    category: [DM.Category.Category],
                    value: analyticsFactory.boxWhiskerIqrValues(DM.Commerce.Cost),
                    outliers: [analyticsFactory.boxWhiskerIqrOutliers(DM.Commerce.Cost)],
                    valueTitle: DM.Commerce.Cost.name,
                  }}
                  styleOptions={styleOptions}
                />
              );
            }}
          </ExecuteQuery>
        )}
      </ExecuteQuery>
    </>
  );
};
