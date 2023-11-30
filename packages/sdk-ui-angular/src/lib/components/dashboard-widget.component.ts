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
  DashboardWidget,
  type DashboardWidgetProps,
  ComponentAdapter,
  createElement,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from '../services/sisense-context.service';
import { ThemeService } from '../services/theme.service';
import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../component-wrapper-helpers';
import { template, rootId } from '../component-wrapper-helpers/template';

/**
 * The Dashboard Widget component, which is a thin wrapper on {@link ChartWidgetComponent},
 * used to render a widget created in the Sisense instance.
 */
@Component({
  selector: 'csdk-dashboard-widget',
  template,
})
export class DashboardWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** @internal */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  @Input()
  widgetOid!: DashboardWidgetProps['widgetOid'];

  @Input()
  dashboardOid!: DashboardWidgetProps['dashboardOid'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: DashboardWidgetProps['filters'];

  @Input()
  highlights: DashboardWidgetProps['highlights'];

  @Input()
  filtersMergeStrategy: DashboardWidgetProps['filtersMergeStrategy'];

  @Input()
  includeDashboardFilters: DashboardWidgetProps['includeDashboardFilters'];

  @Input()
  title: DashboardWidgetProps['title'];

  @Input()
  description: DashboardWidgetProps['description'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.styleOptions}
   *
   * @category Chart
   */
  @Input()
  styleOptions: DashboardWidgetProps['styleOptions'];

  @Input()
  widgetStyleOptions: DashboardWidgetProps['widgetStyleOptions'];

  @Input()
  highlightSelectionDisabled: DashboardWidgetProps['highlightSelectionDisabled'];

  /** @internal */
  @Input()
  drilldownOptions: DashboardWidgetProps['drilldownOptions'];

  private componentAdapter: ComponentAdapter;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(
      () => this.createPreactComponent(),
      [
        createSisenseContextConnector(this.sisenseContextService),
        createThemeContextConnector(this.themeService),
      ],
    );
  }

  /** @internal */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement);
  }

  /** @internal */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement);
    }
  }

  /** @internal */
  private createPreactComponent() {
    const props = {
      widgetOid: this.widgetOid,
      dashboardOid: this.dashboardOid,
      filters: this.filters,
      highlights: this.highlights,
      filtersMergeStrategy: this.filtersMergeStrategy,
      includeDashboardFilters: this.includeDashboardFilters,
      title: this.title,
      description: this.description,
      styleOptions: this.styleOptions,
      widgetStyleOptions: this.widgetStyleOptions,
      highlightSelectionDisabled: this.highlightSelectionDisabled,
      drilldownOptions: this.drilldownOptions,
    };

    return createElement(DashboardWidget, props);
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
