import { Component, Input } from '@angular/core';
import { type ChartType, type ScattermapChartProps } from '@sisense/sdk-ui-preact';

/**
 * An Angular component that allows to visualize geographical data as data points on a map.
 * See [Scattermap Chart](https://docs.sisense.com/main/SisenseLinux/scatter-map.htm) for more information.
 */
@Component({
  selector: 'csdk-scattermap-chart',
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
export class ScattermapChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: ScattermapChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: ScattermapChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: ScattermapChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: ScattermapChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: ScattermapChartProps['styleOptions'];

  /** @internal */
  public chartType: ChartType = 'scattermap';
}
