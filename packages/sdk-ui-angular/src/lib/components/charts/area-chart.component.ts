import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type AreaChartProps as AreaChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link AreaChartComponent} component.
 */
export interface AreaChartProps
  extends WithoutPreactChartEventProps<AreaChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component similar to a {@link LineChartComponent},
 * but with filled in areas under each line and an option to display them as stacked.
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
 *     <csdk-area-chart [dataSet]="DM.DataSource" [dataOptions]="dataOptions"></csdk-area-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [],
 *   };
 * }
 * ```
 * <img src="media://area-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
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
      [dataReady]="dataReady"
      (dataPointClick)="dataPointClick.emit($any($event))"
      (dataPointContextMenu)="dataPointContextMenu.emit($any($event))"
      (dataPointsSelect)="dataPointsSelect.emit($any($event))"
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
  beforeRender: AreaChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!AreaChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: AreaChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'area';
}
