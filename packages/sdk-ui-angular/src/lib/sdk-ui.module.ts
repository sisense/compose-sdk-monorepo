import { NgModule } from '@angular/core';
import { BasicMemberFilterTileComponent } from './components/basic-member-filter-tile.component';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './components/chart.component';

/**
 * SDK UI Module
 */
@NgModule({
  declarations: [BasicMemberFilterTileComponent, ChartComponent],
  imports: [CommonModule],
  exports: [BasicMemberFilterTileComponent, ChartComponent],
  providers: [],
})
export class SdkUiModule {}
