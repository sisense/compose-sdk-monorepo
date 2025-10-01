import { Injectable } from '@angular/core';
import { Filter, FilterRelations } from '@ethings-os/sdk-data';
import {
  type ComposableDashboardProps as ComposableDashboardPropsPreact,
  createHookApiFacade,
  type DashboardProps as DashboardPropsPreact,
  getDashboardModel,
  type GetDashboardModelOptions,
  getDashboardModels,
  type GetDashboardModelsOptions,
  HookAdapter,
  useComposedDashboardInternal,
  UseComposedDashboardOptions,
  WidgetsPanelLayout,
} from '@ethings-os/sdk-ui-preact';
import { BehaviorSubject } from 'rxjs';

import { createSisenseContextConnector } from '../component-wrapper-helpers';
import { type DashboardProps } from '../components/dashboard/dashboard.component';
import { type WidgetProps } from '../components/widgets/widget.component';
import { TrackableService } from '../decorators/trackable.decorator';
import {
  translateFromPreactDashboardProps,
  translateToPreactDashboardProps,
} from '../helpers/dashboard-props-preact-translator';
import { SisenseContextService } from './sisense-context.service';

export interface ComposableDashboardProps extends Omit<ComposableDashboardPropsPreact, 'widgets'> {
  widgets: WidgetProps[];
}

/**
 * Service for working with Sisense Fusion dashboards.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
@Injectable({
  providedIn: 'root',
})
@TrackableService<DashboardService>(['getDashboardModel', 'getDashboardModels'])
export class DashboardService {
  constructor(private sisenseContextService: SisenseContextService) {}

  /**
   * Retrieves an existing dashboard model from the Sisense instance.
   *
   * @param dashboardOid - Identifier of the dashboard
   * @param options - Advanced configuration options
   * @returns Dashboard model
   */
  async getDashboardModel(dashboardOid: string, options?: GetDashboardModelOptions) {
    const app = await this.sisenseContextService.getApp();
    return getDashboardModel(app.httpClient, dashboardOid, options);
  }

  /**
   * Retrieves existing dashboard models from the Sisense instance.
   *
   * @param options - Advanced configuration options
   * @returns Dashboard models array
   */
  async getDashboardModels(options?: GetDashboardModelsOptions) {
    const app = await this.sisenseContextService.getApp();
    return getDashboardModels(app.httpClient, options);
  }

  /**
   * Сomposes dashboard or separate dashboard elements into a coordinated dashboard
   * with cross filtering, and change detection.
   *
   * @example
   * An example of using the `createComposedDashboard` to construct a composed dashboard and render it:
   * ```html
    <!--Component HTML template in example.component.html-->
    <div *ngIf="dashboard$ | async as dashboard">
      <csdk-filter-tile
        *ngFor="let filter of getDashboardFilters(dashboard); trackBy: trackByIndex"
        [filter]="filter"
      />
      <csdk-widget
        *ngFor="let widget of dashboard.widgets; trackBy: trackByIndex"
        [id]="widget.id"
        [widgetType]="widget.widgetType"
        [chartType]="widget.chartType"
        [customWidgetType]="widget.customWidgetType"
        [dataSource]="widget.dataSource"
        [dataOptions]="widget.dataOptions"
        [filters]="widget.filters"
        [highlights]="widget.highlights"
        [styleOptions]="widget.styleOptions"
        [drilldownOptions]="widget.drilldownOptions"
        [title]="widget.title"
        [description]="widget.description"
        [beforeMenuOpen]="widget.beforeMenuOpen"
        (dataPointClick)="widget.dataPointClick?.($event)"
        (dataPointContextMenu)="widget.dataPointContextMenu?.($event)"
        (dataPointsSelect)="widget.dataPointsSelect?.($event)"
      />
    </div>
   * ```
   *
   * ```ts
    // Component behavior in example.component.ts
    import { Component } from '@angular/core';
    import { BehaviorSubject } from 'rxjs';
    import { DashboardService, type DashboardProps } from '@ethings-os/sdk-ui-angular';

    @Component({
      selector: 'example',
      templateUrl: './example.component.html',
      styleUrls: ['./example.component.scss'],
    })
    export class ExampleComponent {
      dashboard$: BehaviorSubject<DashboardProps> | undefined;

      constructor(private dashboardService: DashboardService) {}

      ngOnInit() {
        const initialDashboard: DashboardProps = { ... };
        const composedDashboard = this.dashboardService.createComposedDashboard(initialDashboard);
        this.dashboard$ = composedDashboard.dashboard$;
      }

      trackByIndex = (index: number) => index;

      getDashboardFilters = ({ filters }: DashboardProps) => Array.isArray(filters) ? filters : [];
    }
   * ```
   * @param initialDashboard - Initial dashboard
   * @param options - Configuration options
   * @returns Reactive composed dashboard object and API methods for interacting with it
   */
  createComposedDashboard<D extends ComposableDashboardProps | DashboardProps>(
    initialDashboard: D,
    options: UseComposedDashboardOptions = {},
  ): {
    dashboard$: BehaviorSubject<D>;
    setFilters: (filters: Filter[] | FilterRelations) => Promise<void>;
    setWidgetsLayout: (newLayout: WidgetsPanelLayout) => Promise<void>;
  } {
    const hookAdapter = new HookAdapter(
      useComposedDashboardInternal<ComposableDashboardPropsPreact | DashboardPropsPreact>,
      [createSisenseContextConnector(this.sisenseContextService)],
    );
    const dashboard$ = new BehaviorSubject<D>(initialDashboard);

    hookAdapter.subscribe(({ dashboard }) => {
      dashboard$.next(translateFromPreactDashboardProps(dashboard) as D);
    });

    hookAdapter.run(
      translateToPreactDashboardProps(initialDashboard) as
        | ComposableDashboardPropsPreact
        | DashboardPropsPreact,
      options,
    );

    const setFilters = createHookApiFacade(hookAdapter, 'setFilters', true);
    const setWidgetsLayout = createHookApiFacade(hookAdapter, 'setWidgetsLayout', true);

    return {
      dashboard$,
      setFilters,
      setWidgetsLayout,
    };
  }
}
