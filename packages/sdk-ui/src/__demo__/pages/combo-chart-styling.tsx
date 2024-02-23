import { Chart } from '@/chart';
import { LineStyleOptions } from '@/types';
import * as DM from '../sample-ecommerce';

const mainLineChartStyleOptions: LineStyleOptions = {
  subtype: 'line/basic',
  lineWidth: { width: 'thin' },
  yAxis: {
    title: { enabled: true, text: 'AVG COST' },
  },
  y2Axis: {
    title: { enabled: true, text: 'REVENUE' },
  },
  markers: {
    enabled: true,
    fill: 'hollow',
    size: 'small',
  },
};

export const ComboChartStylingDemo = () => {
  return (
    <>
      <Chart
        dataSet={DM.DataSource}
        chartType={'line'}
        dataOptions={{
          category: [
            {
              column: DM.Commerce.Date.Months,
              dateFormat: 'yy-MM',
            },
          ],
          value: [
            DM.Measures.AvgCost,
            {
              column: DM.Measures.SumRevenue,
              seriesStyleOptions: {
                lineWidth: { width: 'thick' },
                markers: {
                  enabled: true,
                  fill: 'filled',
                  size: 'large',
                },
              },
              showOnRightAxis: true,
              chartType: 'areaspline',
            },
          ],
          breakBy: [],
        }}
        styleOptions={mainLineChartStyleOptions}
      />
      Purple line must be <b>thick</b> and have <b>filled</b> markers
      <br />
      Blue line must be thin and have hollow markers.
    </>
  );
};
