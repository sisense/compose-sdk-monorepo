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
  @Input()
  dataSet: TreemapChartProps['dataSet'];

  @Input()
  dataOptions!: TreemapChartProps['dataOptions'];

  @Input()
  filters: TreemapChartProps['filters'];

  @Input()
  highlights: TreemapChartProps['highlights'];

  @Input()
  styleOptions: TreemapChartProps['styleOptions'];

  @Input()
  beforeRender: TreemapChartProps['onBeforeRender'];

  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<TreemapChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<TreemapChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<TreemapChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  public chartType: ChartType = 'treemap';
}
