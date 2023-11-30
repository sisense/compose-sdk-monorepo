import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type ScatterChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * A component displaying the distribution of two variables on an X-Axis, Y-Axis,
 * and two additional fields of data that are shown as colored circles scattered across the chart.
 *
 * **Point**: A field that for each of its members a scatter point is drawn. The maximum amount of data points is 500.
 *
 * **Size**: An optional field represented by the size of the circles.
 * If omitted, all scatter points are equal in size. If used, the circle sizes are relative to their values.
 *
 * See [Scatter Chart](https://docs.sisense.com/main/SisenseLinux/scatter-chart.htm) for more information.
 */
@Component({
  selector: 'csdk-scatter-chart',
  template: `
    <csdk-chart
      [chartType]="chartType"
      [dataSet]="dataSet"
      [dataOptions]="dataOptions"
      [filters]="filters"
      [highlights]="highlights"
      [styleOptions]="styleOptions"
      [beforeRender]="beforeRender"
      (dataPointClick)="dataPointClick.emit($event)"
      (dataPointContextMenu)="dataPointContextMenu.emit($event)"
      (dataPointsSelect)="dataPointsSelect.emit($event)"
    />
  `,
})
export class ScatterChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: ScatterChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  dataOptions!: ScatterChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: ScatterChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: ScatterChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: ScatterChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: ScatterChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<ScatterChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<ScatterChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<ScatterChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'scatter';
}
