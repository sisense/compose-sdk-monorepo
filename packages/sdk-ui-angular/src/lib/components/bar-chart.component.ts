import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type BarChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * A component representing categorical data with horizontal rectangular bars,
 * whose lengths are proportional to the values that they represent.
 * See [Bar Chart](https://docs.sisense.com/main/SisenseLinux/bar-chart.htm) for more information.
 */
@Component({
  selector: 'csdk-bar-chart',
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
export class BarChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: BarChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: BarChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: BarChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: BarChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: BarChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: BarChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<BarChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<BarChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<BarChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'bar';
}
