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
  Dashboard,
  type DashboardProps,
  ComponentAdapter,
  createElement,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../../component-wrapper-helpers';
import { template, rootId } from '../../component-wrapper-helpers/template';

/**
 * An Angular component used for easily rendering a dashboard created in Sisense Fusion.
 *
 * **Note:** Dashboard extensions based on JS scripts and add-ons in Fusion are not supported.
 *
 * @example
 * ```html
 * <csdk-dashboard
 *  *ngIf="dashboard"
 *  [title]="dashboard!.title"
 *  [layout]="dashboard!.layout"
 *  [widgets]="dashboard!.widgets"
 *  [filters]="dashboard!.filters"
 *  [defaultDataSource]="dashboard!.dataSource"
 *  [widgetFilterOptions]="dashboard!.widgetFilterOptions"
 * />
 * ```
 * ```ts
 * import { Component } from '@angular/core';
 * import { type DashboardModel, DashboardService } from '@sisense/sdk-ui-angular';
 *
 * @Component({
 *  selector: 'app-dashboard',
 *  templateUrl: './dashboard.component.html',
 *  styleUrls: ['./dashboard.component.scss'],
 * })
 * export class DashboardComponent {
 *
 *  dashboard: DashboardModel | null = null;
 *
 *  constructor(private dashboardService: DashboardService) {}
 *
 *  async ngOnInit(): Promise<void> {
 *    this.dashboard = await this.dashboardService.getDashboardModel('60f3e3e3e4b0e3e3e4b0e3e3', { includeWidgets: true, includeFilters: true });
 *  }
 * ```
 * @group Fusion Embed
 * @fusionEmbed
 * @alpha
 */
@Component({
  selector: 'csdk-dashboard',
  template,
})
export class DashboardComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardProps.title}
   */
  @Input()
  title!: DashboardProps['title'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardProps.layout}
   */
  @Input()
  layout!: DashboardProps['layout'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardProps.widgets}
   */
  @Input()
  widgets!: DashboardProps['widgets'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardProps.filters}
   */
  @Input()
  filters!: DashboardProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardProps.defaultDataSource}
   */
  @Input()
  defaultDataSource: DashboardProps['defaultDataSource'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardProps.widgetFilterOptions}
   */
  @Input()
  widgetFilterOptions: DashboardProps['widgetFilterOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardProps.styleOptions}
   */
  @Input()
  styleOptions: DashboardProps['styleOptions'];

  private componentAdapter: ComponentAdapter;

  /**
   * Constructor for the `Dashboard` component.
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
    this.componentAdapter = new ComponentAdapter(
      () => this.createPreactComponent(),
      [
        createSisenseContextConnector(this.sisenseContextService),
        createThemeContextConnector(this.themeService),
      ],
    );
  }

  /**
   * @internal
   */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement);
  }

  /**
   * @internal
   */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement);
    }
  }

  private createPreactComponent() {
    const props = {
      title: this.title,
      layout: this.layout,
      widgets: this.widgets,
      filters: this.filters,
      defaultDataSource: this.defaultDataSource,
      widgetFilterOptions: this.widgetFilterOptions,
      styleOptions: this.styleOptions,
    };

    return createElement(Dashboard, props);
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
