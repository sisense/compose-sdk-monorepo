import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type ScatterChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * Scatter Chart Component
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
