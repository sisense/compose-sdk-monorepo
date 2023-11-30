import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type AreaChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * A component similar to a {@link LineChartComponent},
 * but with filled in areas under each line and an option to display them as stacked.
 * More info on [Sisense Documentation page](https://docs.sisense.com/main/SisenseLinux/area-chart.htm).
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
      [styleOptions]="styleOptions"
      [beforeRender]="beforeRender"
      (dataPointClick)="dataPointClick.emit($event)"
      (dataPointContextMenu)="dataPointContextMenu.emit($event)"
      (dataPointsSelect)="dataPointsSelect.emit($event)"
    />
  `,
})
export class AreaChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: AreaChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: AreaChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: AreaChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: AreaChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: AreaChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: AreaChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<AreaChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<AreaChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<AreaChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'area';
}
