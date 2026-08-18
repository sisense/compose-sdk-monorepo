import { Component, EventEmitter, Input, Output } from '@angular/core';
import { type KpiChartProps as KpiChartPropsPreact } from '@sisense/sdk-ui-preact';

import { type ChartType } from '../../sdk-ui-core-exports';
import { KpiChartEventProps, WithoutPreactChartEventProps } from '../../types/chart-event-props';
import { KpiDataPointEvent } from '../../types/data-point';

/**
 * Props of the {@link KpiChartComponent} component.
 */
export interface KpiChartProps
  extends WithoutPreactChartEventProps<KpiChartPropsPreact>,
    KpiChartEventProps {}

/**
 * An Angular component that displays a single headline metric as a card, optionally with a
 * sparkline of its trend and a readout comparing it against a baseline.
 *
 * Given just a measure, the card shows that number on its own. Adding a `category` — typically
 * a date dimension — gives it a sparkline and a caption for the period being shown. Adding a
 * `comparison` makes it also report how the metric moved: against the previous period, against
 * a second measure, or against a target.
 *
 * @example
 * ```html
 *    <csdk-kpi-chart
 *      [dataSet]="kpi.dataSet"
 *      [dataOptions]="kpi.dataOptions"
 *      [styleOptions]="kpi.styleOptions"
 *    />
 * ```
 * ```ts
import { Component } from '@angular/core';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from '../../assets/sample-ecommerce';
import type { KpiChartProps } from '@sisense/sdk-ui-angular';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  DM = DM;
  kpi = {
    dataSet: DM.DataSource,
    dataOptions: {
      value: measureFactory.sum(DM.Commerce.Revenue),
      category: DM.Commerce.Date.Months,
      comparison: { type: 'previous-period' },
    },
    styleOptions: {
      title: { text: 'Total Revenue' },
    },
  } as KpiChartProps;
}
 * ```
 * @group Charts
 */
@Component({
  standalone: false,
  selector: 'csdk-kpi-chart',
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
    />
  `,
})
export class KpiChartComponent {
  /**
   * {@inheritDoc @sisense/sdk-ui!KpiChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: KpiChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!KpiChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: KpiChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!KpiChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: KpiChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!KpiChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: KpiChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!KpiChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: KpiChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!KpiChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: KpiChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!KpiChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: KpiChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!KpiChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<KpiDataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!KpiChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<KpiDataPointEvent>();

  /** @internal */
  public chartType: ChartType = 'kpi';
}
