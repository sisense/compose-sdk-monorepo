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
  @Input()
  dataSet: ScatterChartProps['dataSet'];

  @Input()
  dataOptions!: ScatterChartProps['dataOptions'];

  @Input()
  filters: ScatterChartProps['filters'];

  @Input()
  highlights: ScatterChartProps['highlights'];

  @Input()
  styleOptions: ScatterChartProps['styleOptions'];

  @Input()
  beforeRender: ScatterChartProps['onBeforeRender'];

  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<ScatterChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<ScatterChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<ScatterChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  public chartType: ChartType = 'scatter';
}
