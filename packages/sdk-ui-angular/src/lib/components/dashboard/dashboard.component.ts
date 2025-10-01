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
  Dashboard as DashboardPreact,
  type DashboardConfig,
  type DashboardFiltersPanelConfig,
  type DashboardProps as DashboardPropsPreact,
} from '@ethings-os/sdk-ui-preact';

import {
  createCustomWidgetsContextConnector,
  createSisenseContextConnector,
  createThemeContextConnector,
  rootId,
  styles,
  template,
} from '../../component-wrapper-helpers';
import { translateToPreactDashboardProps } from '../../helpers/dashboard-props-preact-translator';
import { CustomWidgetsService } from '../../services/custom-widgets.service';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import { WidgetProps } from '../widgets/widget.component';

// Re-exports related types
export { DashboardConfig, DashboardFiltersPanelConfig };

/**
 * Props of the {@link DashboardComponent}.
 */
export interface DashboardProps extends Omit<DashboardPropsPreact, 'widgets'> {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!DashboardProps.widgets}
   */
  widgets: WidgetProps[];
}

/**
 * An Angular component used for easily rendering a dashboard created in Sisense Fusion.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 *
 * @example
 * ```html
 * <csdk-dashboard
 *  *ngIf="dashboard"
 *  [title]="dashboard.title"
 *  [layoutOptions]="dashboard.layoutOptions"
 *  [widgets]="dashboard.widgets"
 *  [filters]="dashboard.filters"
 *  [defaultDataSource]="dashboard.defaultDataSource"
 *  [widgetsOptions]="dashboard.widgetsOptions"
 * />
 * ```
 *
 * ```ts
 * import { Component } from '@angular/core';
 * import {
 *   type DashboardProps,
 *   DashboardService,
 *   dashboardModelTranslator,
 * } from '@ethings-os/sdk-ui-angular';
 *
 * @Component({
 *  selector: 'app-dashboard',
 *  templateUrl: './dashboard.component.html',
 *  styleUrls: ['./dashboard.component.scss'],
 * })
 * export class DashboardComponent {
 *
 *  dashboard: DashboardProps | null = null;
 *
 *  constructor(private dashboardService: DashboardService) {}
 *
 *  async ngOnInit(): Promise<void> {
 *    const dashboardModel = await this.dashboardService.getDashboardModel('your-dashboard-oid', { includeWidgets: true, includeFilters: true });
 *    this.dashboard = dashboardModelTranslator.toDashboardProps(dashboardModel);
 *  }
 * ```
 *
 * To learn more about this and related dashboard components,
 * see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).
 * @group Dashboards
 */
@Component({
  selector: 'csdk-dashboard',
  template,
  styles,
})
export class DashboardComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @ethings-os/sdk-ui!DashboardProps.title}
   */
  @Input()
  title: DashboardProps['title'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!DashboardProps.layoutOptions}
   */
  @Input()
  layoutOptions: DashboardProps['layoutOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!DashboardProps.config}
   */
  @Input()
  config: DashboardProps['config'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!DashboardProps.widgets}
   */
  @Input()
  widgets!: DashboardProps['widgets'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!DashboardProps.filters}
   */
  @Input()
  filters: DashboardProps['filters'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!DashboardProps.defaultDataSource}
   */
  @Input()
  defaultDataSource: DashboardProps['defaultDataSource'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!DashboardProps.widgetsOptions}
   */
  @Input()
  widgetsOptions: DashboardProps['widgetsOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!DashboardProps.styleOptions}
   */
  @Input()
  styleOptions: DashboardProps['styleOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!DashboardProps.tabbersOptions}
   *
   * @internal
   */
  @Input()
  tabbersOptions: DashboardProps['tabbersOptions'];

  private componentAdapter: ComponentAdapter<typeof DashboardPreact>;

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
    /**
     * Custom widgets service
     *
     * @internal
     * @category Constructor
     */
    public customWidgetsService: CustomWidgetsService,
  ) {
    this.componentAdapter = new ComponentAdapter(DashboardPreact, [
      createCustomWidgetsContextConnector(this.customWidgetsService),
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

  private getPreactComponentProps(): DashboardPropsPreact {
    return translateToPreactDashboardProps({
      title: this.title,
      layoutOptions: this.layoutOptions,
      config: this.config,
      widgets: this.widgets,
      filters: this.filters,
      defaultDataSource: this.defaultDataSource,
      widgetsOptions: this.widgetsOptions,
      styleOptions: this.styleOptions,
      tabbersOptions: this.tabbersOptions,
    });
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
