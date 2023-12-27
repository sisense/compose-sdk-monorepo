import { SeriesType } from '../../chart-options-service.js';
import { BoxplotChartData } from '../../../chart-data/types.js';
import { SeriesWithAlerts } from '../../../types.js';
import { BoxplotChartDesignOptions } from '../design-options.js';

// eslint-disable-next-line max-lines-per-function
export const buildBoxplotSeries = (
  data: BoxplotChartData,
  chartDesignOptions: BoxplotChartDesignOptions,
): SeriesWithAlerts<SeriesType[]> => {
  // todo: add outliers limit warning into alerts
  const alerts: SeriesWithAlerts<SeriesType[]>['alerts'] = [];
  const [boxSerie, outliersSerie] = data.series;
  const { boxplotType } = chartDesignOptions;

  const series: SeriesType[] = [
    {
      ...boxSerie,
      data: boxSerie.data.map((item) => ({
        ...item,
        color: '#0090a1',
        fillColor: boxplotType === 'hollow' ? 'transparent' : '#00cee6',
        innerBoxColor: boxplotType === 'hollow' ? 'transparent' : '#00afc4',
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
      color: '#0090a1',
    },
  ];

  if (outliersSerie) {
    series.push({
      ...outliersSerie,
      data: outliersSerie.data.map((item) => ({
        ...item,
        marker: {
          lineColor: item.blur ? 'rgba(0, 144, 161, 0.3)' : '#0090a1',
        },
      })),
      type: 'scatter',
      legendIndex: 1,
      showInLegend: false,
      marker: {
        enabled: true,
        fillColor: 'transparent',
        lineWidth: 1,
        lineColor: '#0090a1',
      },
      color: '#0090a1',
    });
  }

  return { series, alerts };
};
