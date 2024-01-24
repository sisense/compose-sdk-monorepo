import { Component, Input } from '@angular/core';
import { type ChartType } from '../sdk-ui-core-exports';
import { type IndicatorChartProps } from '@sisense/sdk-ui-preact';

/**
 * A component that provides various options for displaying one or two numeric values as a number, gauge or ticker.
 * See [Indicator](https://docs.sisense.com/main/SisenseLinux/indicator.htm) for more information.
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
      [styleOptions]="styleOptions"
    />
  `,
})
export class IndicatorChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: IndicatorChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: IndicatorChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: IndicatorChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: IndicatorChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: IndicatorChartProps['styleOptions'];

  /** @internal */
  public chartType: ChartType = 'indicator';
}
