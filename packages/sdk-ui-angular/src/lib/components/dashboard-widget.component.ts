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
 * Dashboard Widget Component
 */
@Component({
  selector: 'csdk-dashboard-widget',
  template,
})
export class DashboardWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  @Input()
  widgetOid!: DashboardWidgetProps['widgetOid'];

  @Input()
  dashboardOid!: DashboardWidgetProps['dashboardOid'];

  @Input()
  filters: DashboardWidgetProps['filters'];

  @Input()
  highlights: DashboardWidgetProps['highlights'];

  @Input()
  filtersMergeStrategy: DashboardWidgetProps['filtersMergeStrategy'];

  @Input()
  title: DashboardWidgetProps['title'];

  @Input()
  description: DashboardWidgetProps['description'];

  @Input()
  styleOptions: DashboardWidgetProps['styleOptions'];

  @Input()
  widgetStyleOptions: DashboardWidgetProps['widgetStyleOptions'];

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

  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement);
  }

  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement);
    }
  }

  private createPreactComponent() {
    const props = {
      widgetOid: this.widgetOid,
      dashboardOid: this.dashboardOid,
      filters: this.filters,
      highlights: this.highlights,
      filtersMergeStrategy: this.filtersMergeStrategy,
      title: this.title,
      description: this.description,
      styleOptions: this.styleOptions,
      widgetStyleOptions: this.widgetStyleOptions,
      drilldownOptions: this.drilldownOptions,
    };

    return createElement(DashboardWidget, props);
  }

  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
