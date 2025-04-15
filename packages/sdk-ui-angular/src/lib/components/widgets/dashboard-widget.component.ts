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
  DashboardWidget as DashboardWidgetPreact,
  type DashboardWidgetProps,
} from '@sisense/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../../component-wrapper-helpers';
import { rootId, template } from '../../component-wrapper-helpers/template';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';

/**
 * The Dashboard Widget component, which is a thin wrapper on {@link ChartWidgetComponent},
 * is used to render a widget created in a Sisense Fusion instance.
 *
 * To learn more about using Sisense Fusion Widgets in Compose SDK, see
 * [Sisense Fusion Widgets](https://sisense.dev/guides/sdk/guides/charts/guide-fusion-widgets.html).
 *
 * @example
 * ```html
 * <csdk-dashboard-widget
 *    [widgetOid]="widgetOid"
 *    [dashboardOid]="dashboardOid"
 *    [includeDashboardFilters]="true"
 * />
 * ```
 * ```ts
 * import { Component } from '@angular/core';
 * import { ChartType } from '@sisense/sdk-ui-angular';
 * import { filterFactory, measureFactory } from '@sisense/sdk-data';
 * import * as DM from '../../assets/sample-healthcare-model';
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
 * @deprecated Use the `widget-by-id` component instead.
 * @fusionEmbed
 */
@Component({
  selector: 'csdk-dashboard-widget',
  template,
})
export class DashboardWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** @internal */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.widgetOid}
   *
   * @category Widget
   */
  @Input()
  widgetOid!: DashboardWidgetProps['widgetOid'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.dashboardOid}
   *
   * @category Widget
   */
  @Input()
  dashboardOid!: DashboardWidgetProps['dashboardOid'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: DashboardWidgetProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: DashboardWidgetProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.filtersMergeStrategy}
   *
   * @category Data
   */
  @Input()
  filtersMergeStrategy: DashboardWidgetProps['filtersMergeStrategy'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.includeDashboardFilters}
   *
   * @category Data
   */
  @Input()
  includeDashboardFilters: DashboardWidgetProps['includeDashboardFilters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.title}
   *
   * @category Widget
   */
  @Input()
  title: DashboardWidgetProps['title'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.description}
   *
   * @category Widget
   */
  @Input()
  description: DashboardWidgetProps['description'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.styleOptions}
   *
   * @category Widget
   */
  @Input()
  styleOptions: DashboardWidgetProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.highlightSelectionDisabled}
   *
   * @category Widget
   */
  @Input()
  highlightSelectionDisabled: DashboardWidgetProps['highlightSelectionDisabled'];

  /** @internal */
  @Input()
  drilldownOptions: DashboardWidgetProps['drilldownOptions'];

  private componentAdapter: ComponentAdapter<typeof DashboardWidgetPreact>;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(DashboardWidgetPreact, [
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
  private getPreactComponentProps(): DashboardWidgetProps {
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
    };
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
