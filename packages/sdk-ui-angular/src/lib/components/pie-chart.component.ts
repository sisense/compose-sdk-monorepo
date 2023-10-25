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
  @Input()
  dataSet: PieChartProps['dataSet'];

  @Input()
  dataOptions!: PieChartProps['dataOptions'];

  @Input()
  filters: PieChartProps['filters'];

  @Input()
  highlights: PieChartProps['highlights'];

  @Input()
  styleOptions: PieChartProps['styleOptions'];

  @Input()
  beforeRender: PieChartProps['onBeforeRender'];

  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<PieChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<PieChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<PieChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  public chartType: ChartType = 'pie';
}
