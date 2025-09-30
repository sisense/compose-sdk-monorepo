import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  AreaChartComponent,
  AreamapChartComponent,
  AreaRangeChartComponent,
  BarChartComponent,
  BoxplotChartComponent,
  CalendarHeatmapChartComponent,
  ChartComponent,
  ChartWidgetComponent,
  ColumnChartComponent,
  ContextMenuComponent,
  CriteriaFilterTileComponent,
  DashboardByIdComponent,
  DashboardComponent,
  DateRangeFilterTileComponent,
  DrilldownBreadcrumbsComponent,
  DrilldownWidgetComponent,
  FiltersPanelComponent,
  FilterTileComponent,
  FunnelChartComponent,
  IndicatorChartComponent,
  LineChartComponent,
  MemberFilterTileComponent,
  PieChartComponent,
  PivotTableComponent,
  PivotTableWidgetComponent,
  PolarChartComponent,
  RelativeDateFilterTileComponent,
  ScatterChartComponent,
  ScattermapChartComponent,
  SunburstChartComponent,
  TableComponent,
  TableWidgetComponent,
  TreemapChartComponent,
  WidgetByIdComponent,
  WidgetComponent,
} from './components';
import { DecoratorsModule } from './decorators/decorators.module';

/**
 * SDK UI Module, which is a container for components.
 *
 * @example
 * Example of importing `SdkUiModule` and injecting {@link SisenseContextConfig} into your application:
 *
 * ```ts
 * export const SISENSE_CONTEXT_CONFIG: SisenseContextConfig = {
 *   url: "<instance url>", // replace with the URL of your Sisense instance
 *   token: "<api token>", // replace with the API token of your user account
 *   defaultDataSource: DM.DataSource,
 * };
 *
 * @NgModule({
 *   imports: [
 *     BrowserModule,
 *     SdkUiModule,
 *   ],
 *   declarations: [AppComponent],
 *   providers: [
 *     { provide: SISENSE_CONTEXT_CONFIG_TOKEN, useValue: SISENSE_CONTEXT_CONFIG },
 *   ],
 *   bootstrap: [AppComponent],
 * })
 * ```
 * @group Contexts
 */
@NgModule({
  declarations: [
    ChartComponent,
    TableComponent,
    ChartWidgetComponent,
    ColumnChartComponent,
    BarChartComponent,
    AreaChartComponent,
    CalendarHeatmapChartComponent,
    AreaRangeChartComponent,
    LineChartComponent,
    IndicatorChartComponent,
    ScatterChartComponent,
    PieChartComponent,
    FunnelChartComponent,
    PolarChartComponent,
    TreemapChartComponent,
    SunburstChartComponent,
    TableWidgetComponent,
    WidgetByIdComponent,
    MemberFilterTileComponent,
    DrilldownWidgetComponent,
    DateRangeFilterTileComponent,
    RelativeDateFilterTileComponent,
    CriteriaFilterTileComponent,
    DrilldownBreadcrumbsComponent,
    ContextMenuComponent,
    BoxplotChartComponent,
    ScattermapChartComponent,
    AreamapChartComponent,
    PivotTableComponent,
    DashboardByIdComponent,
    DashboardComponent,
    PivotTableWidgetComponent,
    FilterTileComponent,
    FiltersPanelComponent,
    WidgetComponent,
  ],
  imports: [CommonModule, DecoratorsModule],
  exports: [
    ChartComponent,
    TableComponent,
    ChartWidgetComponent,
    ColumnChartComponent,
    BarChartComponent,
    AreaChartComponent,
    CalendarHeatmapChartComponent,
    AreaRangeChartComponent,
    LineChartComponent,
    IndicatorChartComponent,
    ScatterChartComponent,
    PieChartComponent,
    FunnelChartComponent,
    PolarChartComponent,
    TreemapChartComponent,
    SunburstChartComponent,
    TableWidgetComponent,
    WidgetByIdComponent,
    MemberFilterTileComponent,
    DrilldownWidgetComponent,
    DateRangeFilterTileComponent,
    RelativeDateFilterTileComponent,
    CriteriaFilterTileComponent,
    DrilldownBreadcrumbsComponent,
    ContextMenuComponent,
    BoxplotChartComponent,
    ScattermapChartComponent,
    AreamapChartComponent,
    PivotTableComponent,
    DashboardByIdComponent,
    DashboardComponent,
    PivotTableWidgetComponent,
    FilterTileComponent,
    FiltersPanelComponent,
    WidgetComponent,
  ],
  providers: [],
})
export class SdkUiModule {}
