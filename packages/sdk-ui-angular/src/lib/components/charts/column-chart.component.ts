import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type ColumnChartProps as ColumnChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link ColumnChartComponent}.
 */
export interface ColumnChartProps
  extends WithoutPreactChartEventProps<ColumnChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component representing categorical data with vertical rectangular bars
 * whose heights are proportional to the values that they represent.
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
 *     <csdk-column-chart [dataSet]="DM.DataSource" [dataOptions]="dataOptions"></csdk-column-chart>
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
 * <img src="media://column-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-column-chart',
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
  beforeRender: ColumnChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!ColumnChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: ColumnChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'column';
}
