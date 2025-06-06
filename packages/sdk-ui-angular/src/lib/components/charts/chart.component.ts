import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import {
  Chart as ChartPreact,
  type ChartProps as ChartPropsPreact,
  ComponentAdapter,
} from '@sisense/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
  rootId,
  styles,
  template,
} from '../../component-wrapper-helpers';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import { ChartEventProps, WithoutPreactChartEventProps } from '../../types/chart-event-props';
import {
  ChartDataPointClickEvent,
  ChartDataPointContextMenuEvent,
  ChartDataPointsEvent,
} from '../../types/data-point';
import type { Arguments } from '../../types/utility-types';

/**
 * Props shared across the {@link ChartComponent}.
 */
export interface ChartProps
  extends WithoutPreactChartEventProps<ChartPropsPreact>,
    ChartEventProps {}

/**
 * An Angular component used for easily switching chart types or rendering multiple series of different chart types.
 *
 * @example
 * An example of using the `Chart` component to
 * plot a column chart of the Sample Healthcare data source hosted in a Sisense instance:
 *
 * ```html
 * <!--Component HTML template in .component.html-->
 * <csdk-chart
 *   [chartType]="chart.chartType"
 *   [dataSet]="chart.dataSet"
 *   [dataOptions]="chart.dataOptions"
 *   [filters]="chart.filters"
 *   [styleOptions]="chart.styleOptions"
 * />
 * ```
 *
 * ```ts
 * // Component behavior in .component.ts
 * chart = {
 *   chartType: 'column' as ChartType,
 *   dataSet: DM.DataSource,
 *   dataOptions: {
 *     category: [DM.Admissions.Admission_Time.Months],
 *     value: [measureFactory.count(DM.Admissions.Patient_ID, 'Total Patients')],
 *     breakBy: [],
 *   },
 *   filters: [filterFactory.members(DM.Doctors.Specialty, ['Oncology', 'Cardiology'])],
 *   styleOptions: {
 *     width: 800,
 *     height: 500,
 *     xAxis: {
 *       title: {
 *         text: 'Months',
 *         enabled: true,
 *       },
 *     },
 *     yAxis: {
 *       title: {
 *         text: 'Total Patients',
 *         enabled: true,
 *       },
 *     },
 *   },
 * };
 * ```
 *
 * <img src="media://angular-chart-example.png" width="800px" />
 * @shortDescription Common component for rendering charts of different types including table
 * @group Charts
 */
@Component({
  selector: 'csdk-chart',
  template,
  styles,
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.chartType}
   *
   * @category Chart
   */
  @Input()
  chartType!: ChartProps['chartType'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: ChartProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.dataOptions}
   *
   * @category Chart
   */
  @Input()
  dataOptions!: ChartProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: ChartProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: ChartProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: ChartProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  @Input()
  beforeRender: ChartProps['beforeRender'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!ChartProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: ChartProps['dataReady'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<ChartDataPointClickEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<ChartDataPointContextMenuEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  @Output()
  dataPointsSelect = new EventEmitter<ChartDataPointsEvent>();

  private componentAdapter: ComponentAdapter<typeof ChartPreact>;

  /**
   * Constructor for the `Chart` component.
   *
   * @param sisenseContextService - Sisense context service
   * @param themeService - Theme service
   */
  constructor(
    /**
     * Sisense context service
     *
     * @category Constructor
     */
    public sisenseContextService: SisenseContextService,
    /**
     * Theme service
     *
     * @category Constructor
     */
    public themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(ChartPreact, [
      createSisenseContextConnector(this.sisenseContextService),
      createThemeContextConnector(this.themeService),
    ]);
  }

  /**
   * @internal
   */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
  }

  /**
   * @internal
   */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
    }
  }

  private getPreactComponentProps(): ChartPropsPreact {
    return {
      chartType: this.chartType,
      dataSet: this.dataSet,
      dataOptions: this.dataOptions,
      filters: this.filters,
      highlights: this.highlights,
      styleOptions: this.styleOptions,
      onBeforeRender: this.beforeRender?.bind(this),
      onDataReady: this.dataReady?.bind(this),
      onDataPointClick: (
        ...[point, nativeEvent]: Arguments<ChartPropsPreact['onDataPointClick']>
      ) => this.dataPointClick.emit({ point, nativeEvent } as ChartDataPointClickEvent),
      onDataPointContextMenu: (
        ...[point, nativeEvent]: Arguments<ChartPropsPreact['onDataPointContextMenu']>
      ) => this.dataPointContextMenu.emit({ point, nativeEvent } as ChartDataPointContextMenuEvent),
      onDataPointsSelected: (
        ...[points, nativeEvent]: Arguments<ChartPropsPreact['onDataPointsSelected']>
      ) => this.dataPointsSelect.emit({ points, nativeEvent } as ChartDataPointsEvent),
    };
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
