import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type ColumnChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * A component representing categorical data with vertical rectangular bars
 * whose heights are proportional to the values that they represent.
 * See [Column Chart](https://docs.sisense.com/main/SisenseLinux/column-chart.htm) for more information.
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
  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: ColumnChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: ColumnChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: ColumnChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: ColumnChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: ColumnChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: ColumnChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<ColumnChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<ColumnChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<ColumnChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'column';
}
