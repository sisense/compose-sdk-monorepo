import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type BarChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * Bar Chart Component
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
      [beforeRender]="beforeRender"
      (dataPointClick)="dataPointClick.emit($event)"
      (dataPointContextMenu)="dataPointContextMenu.emit($event)"
      (dataPointsSelect)="dataPointsSelect.emit($event)"
    />
  `,
})
export class BarChartComponent {
  @Input()
  dataSet: BarChartProps['dataSet'];

  @Input()
  dataOptions!: BarChartProps['dataOptions'];

  @Input()
  filters: BarChartProps['filters'];

  @Input()
  highlights: BarChartProps['highlights'];

  @Input()
  styleOptions: BarChartProps['styleOptions'];

  @Input()
  beforeRender: BarChartProps['onBeforeRender'];

  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<BarChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<BarChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<BarChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  public chartType: ChartType = 'bar';
}
