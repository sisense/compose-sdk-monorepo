import type { SeriesLegendItemClickCallbackFunction } from '@sisense/sisense-charts';
import { describe, expect, it, vi } from 'vitest';

import type { ChartDataOptionsInternal } from '../../../..';
import { applyEventHandlersToChart } from './apply-event-handlers';
import type { HighchartsOptionsInternal } from './chart-options-service';

const getLegendItemClickHandler = (
  options: HighchartsOptionsInternal,
): SeriesLegendItemClickCallbackFunction => {
  const handler = options.plotOptions?.series?.events?.legendItemClick;
  if (typeof handler !== 'function') {
    throw new Error('Expected plotOptions.series.events.legendItemClick to be a function');
  }
  return handler;
};

const callLegendItemClick = (handler: SeriesLegendItemClickCallbackFunction, series: SeriesMock) =>
  // The implementation under test doesn't use the `event` argument.
  // We intentionally pass a minimal stub and keep mocks fully local to this spec file.
  (handler as unknown as (this: SeriesMock, event: unknown) => unknown).call(series, {});

type SeriesMock = {
  name: string;
  visible: boolean;
  options: Record<string, unknown>;
  chart: { series: SeriesMock[] };
  setVisible: ReturnType<typeof vi.fn>;
};

const createSeriesMock = ({
  name,
  visible,
  id,
  relatesTo,
}: {
  name: string;
  visible: boolean;
  id?: string;
  relatesTo?: string;
}): Omit<SeriesMock, 'chart'> => ({
  name,
  visible,
  options: {
    ...(id ? { id } : {}),
    ...(relatesTo ? { statisticalSeriesRelatesToSeries: relatesTo } : {}),
  },
  setVisible: vi.fn(),
});

const createChartMock = (series: Array<Omit<SeriesMock, 'chart'>>): SeriesMock[] => {
  const chart = { series: [] as SeriesMock[] };
  const withChart: SeriesMock[] = series.map((s) => ({ ...s, chart }));
  chart.series = withChart;
  return withChart;
};

describe('applyEventHandlersToChart', () => {
  describe('legendItemClick handler', () => {
    it('toggles visibility of related series (matched by name and by id) without affecting unrelated series', () => {
      const dataOptions = {} as unknown as ChartDataOptionsInternal;
      const baseOptions = {} as unknown as HighchartsOptionsInternal;

      const options = applyEventHandlersToChart(baseOptions, dataOptions);
      const legendItemClick = getLegendItemClickHandler(options);

      const clicked = createSeriesMock({ name: 'Actual', visible: true, id: 'series-1' });
      const relatedByName = createSeriesMock({
        name: 'Actual - Forecast',
        visible: true,
        relatesTo: 'Actual',
      });
      const relatedById = createSeriesMock({
        name: 'Actual - Confidence',
        visible: true,
        relatesTo: 'series-1',
      });
      const unrelated = createSeriesMock({
        name: 'Other',
        visible: true,
        relatesTo: 'Other',
      });
      const noRelatesTo = createSeriesMock({ name: 'NoRel', visible: true });

      const [
        clickedSeries,
        relatedByNameSeries,
        relatedByIdSeries,
        unrelatedSeries,
        noRelatesToSeries,
      ] = createChartMock([clicked, relatedByName, relatedById, unrelated, noRelatesTo]);

      const result = callLegendItemClick(legendItemClick, clickedSeries);
      expect(result).toBeUndefined();

      expect(relatedByNameSeries.setVisible).toHaveBeenCalledTimes(1);
      expect(relatedByNameSeries.setVisible).toHaveBeenCalledWith(false, false);

      expect(relatedByIdSeries.setVisible).toHaveBeenCalledTimes(1);
      expect(relatedByIdSeries.setVisible).toHaveBeenCalledWith(false, false);

      expect(unrelatedSeries.setVisible).not.toHaveBeenCalled();
      expect(noRelatesToSeries.setVisible).not.toHaveBeenCalled();
      expect(clickedSeries.setVisible).not.toHaveBeenCalled();
    });

    it('shows related series when clicked series is currently hidden', () => {
      const dataOptions = {} as unknown as ChartDataOptionsInternal;
      const baseOptions = {} as unknown as HighchartsOptionsInternal;

      const options = applyEventHandlersToChart(baseOptions, dataOptions);
      const legendItemClick = getLegendItemClickHandler(options);

      const clicked = createSeriesMock({ name: 'Actual', visible: false, id: 'series-1' });
      const related = createSeriesMock({
        name: 'Actual - Forecast',
        visible: false,
        relatesTo: 'Actual',
      });
      const [clickedSeries, relatedSeries] = createChartMock([clicked, related]);

      callLegendItemClick(legendItemClick, clickedSeries);

      expect(relatedSeries.setVisible).toHaveBeenCalledTimes(1);
      expect(relatedSeries.setVisible).toHaveBeenCalledWith(true, false);
    });

    it('does not match related series by id when clicked series has no id', () => {
      const dataOptions = {} as unknown as ChartDataOptionsInternal;
      const baseOptions = {} as unknown as HighchartsOptionsInternal;

      const options = applyEventHandlersToChart(baseOptions, dataOptions);
      const legendItemClick = getLegendItemClickHandler(options);

      const clicked = createSeriesMock({ name: 'Actual', visible: true });
      const relatedById = createSeriesMock({
        name: 'Actual - Confidence',
        visible: true,
        relatesTo: 'series-1',
      });
      const relatedByName = createSeriesMock({
        name: 'Actual - Forecast',
        visible: true,
        relatesTo: 'Actual',
      });

      const [clickedSeries, relatedByIdSeries, relatedByNameSeries] = createChartMock([
        clicked,
        relatedById,
        relatedByName,
      ]);

      callLegendItemClick(legendItemClick, clickedSeries);

      expect(relatedByNameSeries.setVisible).toHaveBeenCalledTimes(1);
      expect(relatedByNameSeries.setVisible).toHaveBeenCalledWith(false, false);
      expect(relatedByIdSeries.setVisible).not.toHaveBeenCalled();
    });
  });
});
