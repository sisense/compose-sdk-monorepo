// Mocks the Chart component and provides a way to access the rendered charts.
// Use this to simulate user interactions with the chart while actual Chart component is mocked.

import { ChartProps } from '@/props';
import { RenderedChartModel } from './rendered-chart-model';

export type ChartMocksManager = {
  /**
   * Replace the actual Chart component with a mocked version.
   */
  mockChartComponent: () => void;
  /**
   * Restore the actual Chart component.
   */
  unmockChartComponent: () => void;
  /**
   * List of models of rendered charts.
   * Use these models to simulate user interactions with the rendered charts.
   */
  renderedCharts: RenderedChartModel[];
  /**
   * Clear all rendered charts from the mocks.
   */
  clearMocks: () => void;
};

const renderedCharts: RenderedChartModel[] = [];

const mockingConfig = {
  shouldChartBeMocked: false,
};

vi.mock('@/chart', async () => {
  const actualModule = await vi.importActual<typeof import('@/chart')>('@/chart');

  return {
    ...actualModule,
    Chart: (props: ChartProps) => {
      if (!mockingConfig.shouldChartBeMocked) {
        return actualModule.Chart(props); // Use the actual Chart component
      }
      const chartModel = new RenderedChartModel(
        props,
        `Chart_${renderedCharts.length} (${props.chartType})`,
      );
      renderedCharts.push(chartModel);
      return chartModel.render();
    },
  };
});

const mockChartComponent = () => {
  clearMocks();
  mockingConfig.shouldChartBeMocked = true;
};

const unmockChartComponent = () => {
  mockingConfig.shouldChartBeMocked = false;
};

const clearMocks = () => {
  renderedCharts.splice(0, renderedCharts.length);
};

export const chartMocksManager: ChartMocksManager = {
  mockChartComponent,
  unmockChartComponent,
  clearMocks,
  renderedCharts,
};
