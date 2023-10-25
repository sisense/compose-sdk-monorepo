import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type LineChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * Line Chart Component
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
  @Input()
  dataSet: LineChartProps['dataSet'];

  @Input()
  dataOptions!: LineChartProps['dataOptions'];

  @Input()
  filters: LineChartProps['filters'];

  @Input()
  highlights: LineChartProps['highlights'];

  @Input()
  styleOptions: LineChartProps['styleOptions'];

  @Input()
  beforeRender: LineChartProps['onBeforeRender'];

  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<LineChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<LineChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<LineChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  public chartType: ChartType = 'line';
}
