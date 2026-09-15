import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type FunnelChartProps as FunnelChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import {
  RegularChartEventProps,
  WithoutPreactChartEventProps,
} from '../../types/chart-event-props';
import { DataPointEvent, DataPointsEvent } from '../../types/data-point';

/**
 * Props of the {@link FunnelChartComponent}.
 */
export interface FunnelChartProps
  extends WithoutPreactChartEventProps<FunnelChartPropsPreact>,
    RegularChartEventProps {}

/**
 * A component representing data progressively decreasing in size or quantity through a funnel shape.
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
 *     <csdk-funnel-chart
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-funnel-chart>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     category: [DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *   };
 *   styleOptions = { funnelType: 'regular', funnelSize: 'regular', funnelDirection: 'regular' };
 * }
 * ```
 * <img src="media://funnel-chart-example-1.png" width="700px" />
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-funnel-chart',
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
export class FunnelChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: FunnelChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: FunnelChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: FunnelChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: FunnelChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: FunnelChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: FunnelChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!FunnelChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: FunnelChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<DataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<DataPointsEvent>();

  /** @internal */
  public chartType: ChartType = 'funnel';
}
