import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type BarChartProps as BarChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link BarChartComponent}.
 */
export interface BarChartProps
  extends WithoutPreactChartEventProps<BarChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component representing categorical data with horizontal rectangular bars,
 * whose lengths are proportional to the values that they represent.
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
 *     <csdk-bar-chart [dataSet]="DM.DataSource" [dataOptions]="dataOptions"></csdk-bar-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     category: [DM.Commerce.Date.Years],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.Condition],
 *   };
 * }
 * ```
 * <img src="media://bar-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-bar-chart',
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
export class BarChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: BarChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: BarChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: BarChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: BarChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: BarChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: BarChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!BarChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: BarChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'bar';
}
