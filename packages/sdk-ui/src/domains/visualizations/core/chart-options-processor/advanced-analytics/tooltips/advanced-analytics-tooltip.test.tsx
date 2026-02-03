import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

import { MockedSisenseContextProvider } from '@/__test-helpers__';

import ForecastToolipComponent from './forecast-tooltip.js';
import TrendToolipComponent from './trend-tooltip.js';

const forecastTooltipProps = {
  confidenceValue: '80%',
  lowerValue: '1.01M',
  forecastValue: '2.01M',
  upperValue: '3.01M',
  title: 'Total Cost',
  x1Value: '2.01k',
};

const trendTooltipProps = {
  x1Value: '2.01k',
  modelType: 'logarithmic',
  title: 'Total Cost',
  trendData: {
    min: '190.0K',
    max: '4.84M',
    median: '2.28M',
    average: '2.15M',
  },
  localValue: '2.01M',
};

const withContext = (children: React.ReactNode) => (
  <MockedSisenseContextProvider>{children}</MockedSisenseContextProvider>
);

describe('ForecastTooltipComponent', () => {
  it('should render the title and values correctly', () => {
    render(withContext(<ForecastToolipComponent {...forecastTooltipProps} />));

    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('1.01M')).toBeInTheDocument();
    expect(screen.getByText('2.01M')).toBeInTheDocument();
    expect(screen.getByText('3.01M')).toBeInTheDocument();
    expect(screen.getByText('2.01k')).toBeInTheDocument();
  });

  it('should contain translation keys', () => {
    render(withContext(<ForecastToolipComponent {...forecastTooltipProps} />));
    expect(screen.getByText('Forecast')).toBeInTheDocument();
    expect(screen.getByText('Forecast Value')).toBeInTheDocument();
    expect(screen.getByText('Upper Bound')).toBeInTheDocument();
    expect(screen.getByText('Lower Bound')).toBeInTheDocument();
    expect(screen.getByText('Confidence Interval')).toBeInTheDocument();
  });
  it('should match the snapshot', () => {
    const { container } = render(
      withContext(<ForecastToolipComponent {...forecastTooltipProps} />),
    );
    expect(container).toMatchSnapshot();
  });
});

describe('TrendTooltipComponent', () => {
  it('should render the title, model type, and trend data correctly including translation keys', () => {
    render(withContext(<TrendToolipComponent {...trendTooltipProps} />));

    expect(screen.getByText('Trend')).toBeInTheDocument();
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Logarithmic Trend')).toBeInTheDocument();
    expect(screen.getByText('Min 190.0K')).toBeInTheDocument();
    expect(screen.getByText('Max 4.84M')).toBeInTheDocument();
    expect(screen.getByText('Median 2.28M')).toBeInTheDocument();
    expect(screen.getByText('Average 2.15M')).toBeInTheDocument();
  });

  it('should render the local value and x1 value correctly', () => {
    render(withContext(<TrendToolipComponent {...trendTooltipProps} />));

    // Testing for x1 value and local value
    expect(screen.getByText('2.01M')).toBeInTheDocument();
    expect(screen.getByText('2.01k')).toBeInTheDocument();
  });

  it('should match the snapshot', () => {
    const { container } = render(withContext(<TrendToolipComponent {...trendTooltipProps} />));

    expect(container).toMatchSnapshot();
  });
});
