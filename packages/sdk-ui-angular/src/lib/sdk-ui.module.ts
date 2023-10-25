import { NgModule } from '@angular/core';
import { BasicMemberFilterTileComponent } from './components/basic-member-filter-tile.component';
import { CommonModule } from '@angular/common';
import {
  ChartComponent,
  TableComponent,
  ChartWidgetComponent,
  ColumnChartComponent,
  BarChartComponent,
  AreaChartComponent,
  LineChartComponent,
  IndicatorChartComponent,
  ScatterChartComponent,
  PieChartComponent,
  FunnelChartComponent,
  PolarChartComponent,
  TreemapChartComponent,
  TableWidgetComponent,
  DashboardWidgetComponent,
} from './components';

/**
 * SDK UI Module
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
    LineChartComponent,
    IndicatorChartComponent,
    ScatterChartComponent,
    PieChartComponent,
    FunnelChartComponent,
    PolarChartComponent,
    TreemapChartComponent,
    TableWidgetComponent,
    DashboardWidgetComponent,
  ],
  imports: [CommonModule],
  exports: [
    BasicMemberFilterTileComponent,
    ChartComponent,
    TableComponent,
    ChartWidgetComponent,
    ColumnChartComponent,
    BarChartComponent,
    AreaChartComponent,
    LineChartComponent,
    IndicatorChartComponent,
    ScatterChartComponent,
    PieChartComponent,
    FunnelChartComponent,
    PolarChartComponent,
    TreemapChartComponent,
    TableWidgetComponent,
    DashboardWidgetComponent,
  ],
  providers: [],
})
export class SdkUiModule {}
