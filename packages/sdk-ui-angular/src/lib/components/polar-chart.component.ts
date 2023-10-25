import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type PolarChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * Polar Chart Component
 */
@Component({
  selector: 'csdk-polar-chart',
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
export class PolarChartComponent {
  @Input()
  dataSet: PolarChartProps['dataSet'];

  @Input()
  dataOptions!: PolarChartProps['dataOptions'];

  @Input()
  filters: PolarChartProps['filters'];

  @Input()
  highlights: PolarChartProps['highlights'];

  @Input()
  styleOptions: PolarChartProps['styleOptions'];

  @Input()
  beforeRender: PolarChartProps['onBeforeRender'];

  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<PolarChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<PolarChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<PolarChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  public chartType: ChartType = 'polar';
}
