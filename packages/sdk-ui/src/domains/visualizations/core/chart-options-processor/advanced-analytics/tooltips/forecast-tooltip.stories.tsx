import { templateForComponent } from '@/__stories__/template';

import { default as ForecastToolipComponent } from './forecast-tooltip.js';

const template = templateForComponent(ForecastToolipComponent);

export default {
  title: 'Charts/Tooltips/Forecast Tooltip',
  component: ForecastToolipComponent,
  argTypes: {},
};

export const ForecastToolip = template({
  confidenceValue: '80%',
  lowerValue: '1.01M',
  forecastValue: '2.01M',
  upperValue: '3.01M',
  title: 'Total Cost',
  x1Value: '2.01k',
});
