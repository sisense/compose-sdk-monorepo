import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type AreaChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * Area Chart Component
 */
@Component({
  selector: 'csdk-area-chart',
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
export class AreaChartComponent {
  @Input()
  dataSet: AreaChartProps['dataSet'];

  @Input()
  dataOptions!: AreaChartProps['dataOptions'];

  @Input()
  filters: AreaChartProps['filters'];

  @Input()
  highlights: AreaChartProps['highlights'];

  @Input()
  styleOptions: AreaChartProps['styleOptions'];

  @Input()
  beforeRender: AreaChartProps['onBeforeRender'];

  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<AreaChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<AreaChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<AreaChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  public chartType: ChartType = 'area';
}
