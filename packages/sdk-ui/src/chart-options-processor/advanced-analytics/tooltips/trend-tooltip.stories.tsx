import { templateForComponent } from '@/__stories__/template';
import { default as TrendToolipComponent } from './trend-tooltip';

const template = templateForComponent(TrendToolipComponent);

export default {
  title: 'Charts/Tooltips/Trend Tooltip',
  component: TrendToolipComponent,
  argTypes: {},
};

export const TrendToolip = template({
  x1Value: '2.01k',
  // x2Value: '10',
  modelType: 'logarithmic',
  title: 'Total Cost',
  // trendData: ['Min 190.0K', 'Max 4.84M', 'Median 2.28M', 'Average 2.15M'],
  trendData: {
    min: '190.0K',
    max: '4.84M',
    median: '2.28M',
    average: '2.15M',
  },
  localValue: '2.01M',
});
