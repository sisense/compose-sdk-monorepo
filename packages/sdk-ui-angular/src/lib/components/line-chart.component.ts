import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type LineChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * A component displaying data as a series of points connected by a line. Used to show trends or changes over time.
 * See [Line Chart](https://docs.sisense.com/main/SisenseLinux/line-chart.htm) for more information.
 */
@Component({
  selector: 'csdk-line-chart',
  template: `
    <csdk-chart
      [chartType]="chartType"
      [dataSet]="dataSet"
      [dataOptions]="dataOptions"
      [filters]="filters"
      [highlights]="highlights"
      [beforeRender]="beforeRender"
      (dataPointClick)="dataPointClick.emit($event)"
      (dataPointContextMenu)="dataPointContextMenu.emit($event)"
      (dataPointsSelect)="dataPointsSelect.emit($event)"
    />
  `,
})
export class LineChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: LineChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  dataOptions!: LineChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: LineChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: LineChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: LineChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: LineChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<LineChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<LineChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<LineChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'line';
}
