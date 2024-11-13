import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BasicMemberFilterTileComponent,
  ChartComponent,
  TableComponent,
  ChartWidgetComponent,
  ColumnChartComponent,
  BarChartComponent,
  AreaChartComponent,
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
  DashboardWidgetComponent,
  WidgetByIdComponent,
  MemberFilterTileComponent,
  DrilldownWidgetComponent,
  DateRangeFilterTileComponent,
  CriteriaFilterTileComponent,
  DrilldownBreadcrumbsComponent,
  ContextMenuComponent,
  BoxplotChartComponent,
  ScattermapChartComponent,
  AreamapChartComponent,
  PivotTableComponent,
  DashboardByIdComponent,
  DashboardComponent,
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
 *   url="<instance url>" // replace with the URL of your Sisense instance
 *   token="<api token>" // replace with the API token of your user account
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
 *
 * @group Contexts
 */
@NgModule({
  declarations: [
    BasicMemberFilterTileComponent,
    ChartComponent,
    TableComponent,
    ChartWidgetComponent,
    ColumnChartComponent,
    BarChartComponent,
    AreaChartComponent,
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
    DashboardWidgetComponent,
    WidgetByIdComponent,
    MemberFilterTileComponent,
    DrilldownWidgetComponent,
    DateRangeFilterTileComponent,
    CriteriaFilterTileComponent,
    DrilldownBreadcrumbsComponent,
    ContextMenuComponent,
    BoxplotChartComponent,
    ScattermapChartComponent,
    AreamapChartComponent,
    PivotTableComponent,
    DashboardByIdComponent,
    DashboardComponent,
  ],
  imports: [CommonModule, DecoratorsModule],
  exports: [
    BasicMemberFilterTileComponent,
    ChartComponent,
    TableComponent,
    ChartWidgetComponent,
    ColumnChartComponent,
    BarChartComponent,
    AreaChartComponent,
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
    DashboardWidgetComponent,
    WidgetByIdComponent,
    MemberFilterTileComponent,
    DrilldownWidgetComponent,
    DateRangeFilterTileComponent,
    CriteriaFilterTileComponent,
    DrilldownBreadcrumbsComponent,
    ContextMenuComponent,
    BoxplotChartComponent,
    ScattermapChartComponent,
    AreamapChartComponent,
    PivotTableComponent,
    DashboardByIdComponent,
    DashboardComponent,
  ],
  providers: [],
})
export class SdkUiModule {}
