import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type ColumnChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * Column Chart Component
 */
@Component({
  selector: 'csdk-column-chart',
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
export class ColumnChartComponent {
  @Input()
  dataSet: ColumnChartProps['dataSet'];

  @Input()
  dataOptions!: ColumnChartProps['dataOptions'];

  @Input()
  filters: ColumnChartProps['filters'];

  @Input()
  highlights: ColumnChartProps['highlights'];

  @Input()
  styleOptions: ColumnChartProps['styleOptions'];

  @Input()
  beforeRender: ColumnChartProps['onBeforeRender'];

  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<ColumnChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<ColumnChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<ColumnChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  public chartType: ChartType = 'column';
}
