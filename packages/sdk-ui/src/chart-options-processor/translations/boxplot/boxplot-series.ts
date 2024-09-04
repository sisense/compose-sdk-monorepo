import { SeriesType } from '../../chart-options-service.js';
import { BoxplotChartData } from '../../../chart-data/types.js';
import { Color, SeriesWithAlerts } from '../../../types.js';
import { BoxplotChartDesignOptions } from '../design-options.js';
import { applyOpacity, scaleBrightness } from '@/utils/color/color-interpolation.js';
import { getPaletteColor } from '@/chart-data-options/coloring/utils.js';

// eslint-disable-next-line max-lines-per-function
export const buildBoxplotSeries = (
  data: BoxplotChartData,
  chartDesignOptions: BoxplotChartDesignOptions,
  paletteColors?: Color[],
): SeriesWithAlerts<SeriesType[]> => {
  // todo: add outliers limit warning into alerts
  const alerts: SeriesWithAlerts<SeriesType[]>['alerts'] = [];
  const [boxSerie, outliersSerie] = data.series;
  const { boxplotType } = chartDesignOptions;

  const colorChangeCoefficient = 0.15;

  const baseColor = getPaletteColor(paletteColors, 0);

  const upperQuartileColor = baseColor;
  const lowerQuartileColor = scaleBrightness(baseColor, -1 * colorChangeCoefficient);
  const lineColor = scaleBrightness(baseColor, -2 * colorChangeCoefficient);
  const blurredLineColor = applyOpacity(lineColor, 2 * colorChangeCoefficient);

  const series: SeriesType[] = [
    {
      ...boxSerie,
      data: boxSerie.data.map((item) => ({
        ...item,
        color: lineColor,
        fillColor: boxplotType === 'hollow' ? 'transparent' : upperQuartileColor,
        innerBoxColor: boxplotType === 'hollow' ? 'transparent' : lowerQuartileColor,
        selected: item.blur ?? false,
      })),
      medianWidth: 1,
      maxPointWidth: 42,
      minPointWidth: 20,
      whiskerWidth: 1,
      whiskerLength: '100%',
      fillOpacity: 0.8,
      strokeOpacity: 0.8,
      showInLegend: true,
      legendIndex: 0,
      yAxis: 0,
      color: lineColor,
    },
  ];

  if (outliersSerie) {
    series.push({
      ...outliersSerie,
      data: outliersSerie.data.map((item) => ({
        ...item,
        marker: {
          lineColor: item.blur ? blurredLineColor : lineColor,
        },
      })),
      type: 'scatter',
      legendIndex: 1,
      showInLegend: false,
      marker: {
        enabled: true,
        fillColor: 'transparent',
        lineWidth: 1,
        lineColor: lineColor,
      },
      color: lineColor,
    });
  }

  return { series, alerts };
};
