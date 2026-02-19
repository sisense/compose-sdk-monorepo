import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  ComponentAdapter,
  WidgetById as WidgetByIdPreact,
  type WidgetByIdProps as WidgetByIdPropsPreact,
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
import { BaseChartEventProps, WithoutPreactChartEventProps } from '../../types';

/**
 * Props of the {@link WidgetByIdComponent}.
 */
export interface WidgetByIdProps
  extends WithoutPreactChartEventProps<WidgetByIdPropsPreact>,
    BaseChartEventProps {}

/**
 * The `WidgetById` component, which is a thin wrapper on {@link ChartWidgetComponent},
 * is used to render a widget created in a Sisense Fusion instance.
 *
 * To learn more about using Sisense Fusion Widgets in Compose SDK, see
 * [Sisense Fusion Widgets](https://developer.sisense.com/guides/sdk/guides/charts/guide-fusion-widgets.html).
 *
 * @example
 * ```html
 * <csdk-widget-by-id
 *    [widgetOid]="widgetOid"
 *    [dashboardOid]="dashboardOid"
 *    [includeDashboardFilters]="true"
 * />
 * ```
 * ```ts
 * import { Component } from '@angular/core';
 *
 * @Component({
 *  selector: 'app-widgets',
 *  templateUrl: './widgets.component.html',
 *  styleUrls: ['./widgets.component.scss'],
 * })
 * export class WidgetsComponent {
 *  widgetOid: string = '60f3e3e3e4b0e3e3e4b0e3e3';
 *  dashboardOid: string = '60f3e3e3e4b0e3e3e4b0e3e3';
 * }
 * ```
 * @group Fusion Assets
 * @fusionEmbed
 */
@Component({
  selector: 'csdk-widget-by-id',
  template,
  styles,
})
export class WidgetByIdComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** @internal */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.widgetOid}
   *
   * @category Widget
   */
  @Input()
  widgetOid!: WidgetByIdProps['widgetOid'];

  /**
   * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.dashboardOid}
   *
   * @category Widget
   */
  @Input()
  dashboardOid!: WidgetByIdProps['dashboardOid'];

  /**
   * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: WidgetByIdProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: WidgetByIdProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.filtersMergeStrategy}
   *
   * @category Data
   */
  @Input()
  filtersMergeStrategy: WidgetByIdProps['filtersMergeStrategy'];

  /**
   * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.includeDashboardFilters}
   *
   * @category Data
   */
  @Input()
  includeDashboardFilters: WidgetByIdProps['includeDashboardFilters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.title}
   *
   * @category Widget
   */
  @Input()
  title: WidgetByIdProps['title'];

  /**
   * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.description}
   *
   * @category Widget
   */
  @Input()
  description: WidgetByIdProps['description'];

  /**
   * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.styleOptions}
   *
   * @category Widget
   */
  @Input()
  styleOptions: WidgetByIdProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.highlightSelectionDisabled}
   *
   * @category Widget
   */
  @Input()
  highlightSelectionDisabled: WidgetByIdProps['highlightSelectionDisabled'];

  /** @internal */
  @Input()
  drilldownOptions: WidgetByIdProps['drilldownOptions'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!WidgetByIdProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: WidgetByIdProps['dataReady'];

  private componentAdapter: ComponentAdapter<typeof WidgetByIdPreact>;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(WidgetByIdPreact, [
      createSisenseContextConnector(this.sisenseContextService),
      createThemeContextConnector(this.themeService),
    ]);
  }

  /** @internal */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
  }

  /** @internal */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
    }
  }

  /** @internal */
  private getPreactComponentProps(): WidgetByIdPropsPreact {
    return {
      widgetOid: this.widgetOid,
      dashboardOid: this.dashboardOid,
      filters: this.filters,
      highlights: this.highlights,
      filtersMergeStrategy: this.filtersMergeStrategy,
      includeDashboardFilters: this.includeDashboardFilters,
      title: this.title,
      description: this.description,
      styleOptions: this.styleOptions,
      highlightSelectionDisabled: this.highlightSelectionDisabled,
      drilldownOptions: this.drilldownOptions,
      onDataReady: this.dataReady?.bind(this),
    };
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
