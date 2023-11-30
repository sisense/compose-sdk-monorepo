import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ChartType, type SunburstChartProps } from '@sisense/sdk-ui-preact';
import { type ArgumentsAsObject } from '../utility-types';

/**
 * A component displaying hierarchical data in the form of nested slices.
 * This type of chart can be used instead of a pie chart for comparing a large number of categories and sub-categories.
 * See [Sunburst Chart](https://docs.sisense.com/main/SisenseLinux/sunburst-widget.htm) for more information.
 */
@Component({
  selector: 'csdk-sunburst-chart',
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
export class SunburstChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: SunburstChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: SunburstChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: SunburstChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: SunburstChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: SunburstChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: SunburstChartProps['onBeforeRender'];

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<
    ArgumentsAsObject<SunburstChartProps['onDataPointClick'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<
    ArgumentsAsObject<SunburstChartProps['onDataPointContextMenu'], ['point', 'nativeEvent']>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<
    ArgumentsAsObject<SunburstChartProps['onDataPointsSelected'], ['points', 'nativeEvent']>
  >();

  /** @internal */
  public chartType: ChartType = 'sunburst';
}
