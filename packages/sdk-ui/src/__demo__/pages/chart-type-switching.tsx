import { useState } from 'react';
import * as DM from '../sample-ecommerce';
import { filters, measures } from '@sisense/sdk-data';
import { Chart } from '../../chart';
import { ChartType } from '../../types';

const switchableChartTypes: ChartType[] = [
  'line',
  'area',
  'bar',
  'column',
  'polar',
  'pie',
  'funnel',
];

const dataOptions = {
  category: [DM.Commerce.Condition],
  value: [
    measures.divide(
      measures.sum(DM.Commerce.Revenue),
      measures.count(DM.Commerce.VisitID),
      'Custom Average',
    ),
    measures.count(DM.Commerce.Revenue),
  ],
  breakBy: [DM.Commerce.AgeRange],
};
const chartFilters = [filters.greaterThan(DM.Commerce.Revenue, 0)];
const styleOptions = {
  legend: {
    enabled: true,
    position: 'bottom',
  },
};

export const ChartTypeSwitchingDemo: React.FC = () => {
  const [chartType, setChartType] = useState<ChartType>(switchableChartTypes[0]);
  return (
    <>
      <div>
        {switchableChartTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setChartType(type)}
            disabled={type === chartType}
          >
            {type}
          </button>
        ))}
      </div>
      <Chart
        dataSet={DM.DataSource}
        chartType={chartType}
        filters={chartFilters}
        dataOptions={dataOptions}
        styleOptions={styleOptions}
      />
    </>
  );
};
