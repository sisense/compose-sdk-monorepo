import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type LineChartProps as LineChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link LineChartComponent}.
 */
export interface LineChartProps
  extends WithoutPreactChartEventProps<LineChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component displaying data as a series of points connected by a line. Used to show trends or changes over time.
 *
 * @example
 * ```ts
 * import { Component } from '@angular/core';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-line-chart [dataSet]="DM.DataSource" [dataOptions]="dataOptions"></csdk-line-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.Condition],
 *   };
 * }
 * ```
 * <img src="media://line-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-line-chart',
  template: `
    <csdk-chart
      [chartType]="chartType"
      [dataSet]="dataSet"
      [dataOptions]="dataOptions"
      [filters]="filters"
      [highlights]="highlights"
      [styleOptions]="styleOptions"
      [beforeRender]="beforeRender"
      [dataReady]="dataReady"
      (dataPointClick)="dataPointClick.emit($any($event))"
      (dataPointContextMenu)="dataPointContextMenu.emit($any($event))"
      (dataPointsSelect)="dataPointsSelect.emit($any($event))"
    />
  `,
})
export class LineChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: LineChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.dataOptions}
   *
   * @category Data
   */
  @Input()
  dataOptions!: LineChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: LineChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: LineChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: LineChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: LineChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!LineChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: LineChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'line';
}
