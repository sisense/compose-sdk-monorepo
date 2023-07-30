import { NgModule } from '@angular/core';
import { BasicMemberFilterTileComponent } from './basic-member-filter-tile.component';
import { ExecuteQueryComponent } from './execute-query.component';
import { CommonModule } from '@angular/common';

/**
 * SDK Module
 */
@NgModule({
  declarations: [BasicMemberFilterTileComponent, ExecuteQueryComponent],
  imports: [CommonModule],
  exports: [BasicMemberFilterTileComponent, ExecuteQueryComponent],
  providers: [],
})
export class SdkModule {}
