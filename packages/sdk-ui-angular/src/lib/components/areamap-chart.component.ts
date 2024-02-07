import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type AreamapChartProps } from '@sisense/sdk-ui-preact';
import { ArgumentsAsObject } from '../types/utility-types';

/**
 * An Angular component that allows to visualize geographical data as polygons on a map.
 * See [Areamap Chart](https://docs.sisense.com/main/SisenseLinux/area-map.htm) for more information.
 */
@Component({
  selector: 'csdk-areamap-chart',
  template: `
    <csdk-chart
      [chartType]="chartType"
      [dataSet]="dataSet"
      [dataOptions]="dataOptions"
      [filters]="filters"
      [highlights]="highlights"
      [styleOptions]="styleOptions"
      (dataPointClick)="dataPointClick.emit($event)"
    />
  `,
})
export class AreamapChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: AreamapChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: AreamapChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: AreamapChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: AreamapChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: AreamapChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<AreamapChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'areamap';
}
