import { Component, Input } from '@angular/core';
import { type ChartType, type IndicatorChartProps } from '@sisense/sdk-ui-preact';

/**
 * Indicator Chart Component
 */
@Component({
  selector: 'csdk-indicator-chart',
  template: `
    <csdk-chart
      [chartType]="chartType"
      [dataSet]="dataSet"
      [dataOptions]="dataOptions"
      [filters]="filters"
      [highlights]="highlights"
    />
  `,
})
export class IndicatorChartComponent {
  @Input()
  dataSet: IndicatorChartProps['dataSet'];

  @Input()
  dataOptions!: IndicatorChartProps['dataOptions'];

  @Input()
  filters: IndicatorChartProps['filters'];

  @Input()
  highlights: IndicatorChartProps['highlights'];

  @Input()
  styleOptions: IndicatorChartProps['styleOptions'];

  public chartType: ChartType = 'indicator';
}
