import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type TreemapChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * Treemap Chart Component
 */
@Component({
  selector: 'csdk-treemap-chart',
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
export class TreemapChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: TreemapChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: TreemapChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: TreemapChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: TreemapChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: TreemapChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: TreemapChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<TreemapChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<TreemapChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<TreemapChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'treemap';
}
