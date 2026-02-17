import { Injectable } from '@angular/core';
import { Filter, FilterRelations } from '@sisense/sdk-data';
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
} from '@sisense/sdk-ui-preact';
import { BehaviorSubject } from 'rxjs';

import { createSisenseContextConnector } from '../component-wrapper-helpers';
import { type DashboardProps } from '../components/dashboard/dashboard.component';
import { type WidgetProps } from '../components/widgets/widget.component';
import { TrackableService } from '../decorators/trackable.decorator';
import {
  toDashboardProps,
  toPreactDashboardProps,
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
    import { Component, OnDestroy } from '@angular/core';
    import { BehaviorSubject } from 'rxjs';
    import { DashboardService, type DashboardProps } from '@sisense/sdk-ui-angular';

    @Component({
      selector: 'example',
      templateUrl: './example.component.html',
      styleUrls: ['./example.component.scss'],
    })
    export class ExampleComponent implements OnDestroy {
      dashboard$: BehaviorSubject<DashboardProps> | undefined;
      private composedDashboard: ReturnType<DashboardService['createComposedDashboard']> | undefined;

      constructor(private dashboardService: DashboardService) {}

      ngOnInit() {
        const initialDashboard: DashboardProps = { ... };
        this.composedDashboard = this.dashboardService.createComposedDashboard(initialDashboard);
        this.dashboard$ = this.composedDashboard.dashboard$;
      }

      ngOnDestroy() {
        this.composedDashboard?.destroy();
      }

      trackByIndex = (index: number) => index;

      getDashboardFilters = ({ filters }: DashboardProps) => Array.isArray(filters) ? filters : [];
    }
   * ```
   * @param initialDashboard - Initial dashboard
   * @param options - Configuration options
   * @returns Reactive composed dashboard object and API methods for interacting with it.
   * The returned object includes a `destroy()` method that should be called when
   * the dashboard is no longer needed to prevent memory leaks (e.g., in `ngOnDestroy`).
   */
  createComposedDashboard<D extends ComposableDashboardProps | DashboardProps>(
    initialDashboard: D,
    options: UseComposedDashboardOptions = {},
  ): {
    dashboard$: BehaviorSubject<D>;
    setFilters: (filters: Filter[] | FilterRelations) => Promise<void>;
    setWidgetsLayout: (newLayout: WidgetsPanelLayout) => Promise<void>;
    destroy: () => void;
  } {
    const hookAdapter = new HookAdapter(
      useComposedDashboardInternal<ComposableDashboardPropsPreact | DashboardPropsPreact>,
      [createSisenseContextConnector(this.sisenseContextService)],
    );
    const dashboard$ = new BehaviorSubject<D>(initialDashboard);

    hookAdapter.subscribe(({ dashboard }) => {
      dashboard$.next(toDashboardProps(dashboard) as D);
    });

    hookAdapter.run(
      toPreactDashboardProps(initialDashboard) as
        | ComposableDashboardPropsPreact
        | DashboardPropsPreact,
      options,
    );

    const setFilters = createHookApiFacade(hookAdapter, 'setFilters', true);
    const setWidgetsLayout = createHookApiFacade(hookAdapter, 'setWidgetsLayout', true);

    const destroy = () => {
      hookAdapter.destroy();
      dashboard$.complete();
    };

    return {
      dashboard$,
      setFilters,
      setWidgetsLayout,
      destroy,
    };
  }
}
