import {
  type DashboardModel,
  dashboardModelTranslator as dashboardModelTranslatorPreact,
} from '@ethings-os/sdk-ui-preact';

import { type DashboardProps } from '../components';

/**
 * Translates {@link DashboardModel} to {@link DashboardProps}.
 *
 * @example
 * ```html
<csdk-dashboard
  *ngIf="dashboard"
  [title]="dashboard.title"
  [layoutOptions]="dashboard.layoutOptions"
  [widgets]="dashboard.widgets"
  [filters]="dashboard.filters"
  [defaultDataSource]="dashboard.defaultDataSource"
  [widgetsOptions]="dashboard.widgetsOptions"
/>
 * ```
 *
 * ```ts
import { Component } from '@angular/core';
import {
  type DashboardProps,
  DashboardService,
  dashboardModelTranslator,
} from '@ethings-os/sdk-ui-angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  dashboard: DashboardProps | null = null;

  constructor(private dashboardService: DashboardService) {}

  async ngOnInit(): Promise<void> {
    const dashboardModel = await this.dashboardService.getDashboardModel('your-dashboard-oid', {
      includeWidgets: true,
      includeFilters: true,
    });
    this.dashboard = dashboardModelTranslator.toDashboardProps(dashboardModel);
  }
}
 * ```
 */
export function toDashboardProps(dashboardModel: DashboardModel): DashboardProps {
  return dashboardModelTranslatorPreact.toDashboardProps(dashboardModel);
}
