import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type PieChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * Pie Chart Component
 */
@Component({
  selector: 'csdk-pie-chart',
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
export class PieChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: PieChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  dataOptions!: PieChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: PieChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: PieChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: PieChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: PieChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<PieChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<PieChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<PieChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'pie';
}
