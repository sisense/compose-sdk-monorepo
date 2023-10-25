import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type FunnelChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * Funnel Chart Component
 */
@Component({
  selector: 'csdk-funnel-chart',
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
export class FunnelChartComponent {
  @Input()
  dataSet: FunnelChartProps['dataSet'];

  @Input()
  dataOptions!: FunnelChartProps['dataOptions'];

  @Input()
  filters: FunnelChartProps['filters'];

  @Input()
  highlights: FunnelChartProps['highlights'];

  @Input()
  styleOptions: FunnelChartProps['styleOptions'];

  @Input()
  beforeRender: FunnelChartProps['onBeforeRender'];

  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<FunnelChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<FunnelChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<FunnelChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  public chartType: ChartType = 'funnel';
}
