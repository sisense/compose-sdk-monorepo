import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service';
import { CompleteThemeSettings } from '@/index-typedoc';
import { TFunction } from '@sisense/sdk-common';
import { TypedChartData, TypedDataOptionsInternal, TypedDesignOptions } from '../types';

export type HighchartBasedChartTypes =
  | 'column'
  | 'bar'
  | 'line'
  | 'area'
  | 'polar'
  | 'pie'
  | 'funnel'
  | 'treemap'
  | 'calendar-heatmap'
  | 'sunburst';

export type HighchartsOptionsBuilder<CT extends HighchartBasedChartTypes> = {
  getChart: (ctx: BuildContext<CT>) => HighchartsOptionsInternal['chart'];
  getSeries: (ctx: BuildContext<CT>) => HighchartsOptionsInternal['series'];
  getAxes: (ctx: BuildContext<CT>) => {
    xAxis: HighchartsOptionsInternal['xAxis'];
    yAxis: HighchartsOptionsInternal['yAxis'];
  };
  getLegend: (ctx: BuildContext<CT>) => HighchartsOptionsInternal['legend'];
  getPlotOptions: (ctx: BuildContext<CT>) => HighchartsOptionsInternal['plotOptions'];
  getTooltip: (ctx: BuildContext<CT>) => HighchartsOptionsInternal['tooltip'];
  getExtras: (ctx: BuildContext<CT>) => Partial<HighchartsOptionsInternal>;
};

export type BuildContext<CT extends HighchartBasedChartTypes> = {
  chartData: TypedChartData<CT>;
  dataOptions: TypedDataOptionsInternal<CT>;
  designOptions: TypedDesignOptions<CT>;
  extraConfig: {
    translate: TFunction;
    themeSettings: CompleteThemeSettings;
    dateFormatter: (date: Date, format: string) => string;
    accessibilityEnabled: boolean;
  };
};
