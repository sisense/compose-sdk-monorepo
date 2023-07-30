import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import {
  BasicMemberFilterTile,
  BasicMemberFilterTileProps,
  preactRenderComponent,
} from '@sisense/sdk-ui-preact';

/**
 * Filter Tile Component
 */
@Component({
  selector: 'lib-basic-member-filter-tile',
  template: `<div #preact></div>`,
})
export class BasicMemberFilterTileComponent {
  @ViewChild('preact')
  preactRef!: ElementRef<HTMLDivElement>;

  @Input('title')
  title!: BasicMemberFilterTileProps['title'];

  @Input('allMembers')
  allMembers!: BasicMemberFilterTileProps['allMembers'];

  @Input('initialSelectedMembers')
  initialSelectedMembers: BasicMemberFilterTileProps['initialSelectedMembers'];

  @Input('maxAllowedMembers')
  maxAllowedMembers: BasicMemberFilterTileProps['maxAllowedMembers'];

  ngAfterViewInit() {
    this.renderPreactElement();
  }

  ngOnChanges() {
    if (this.preactRef) {
      this.renderPreactElement();
    }
  }

  renderPreactElement = () => {
    preactRenderComponent(this.preactRef.nativeElement, BasicMemberFilterTile, {
      allMembers: this.allMembers,
      initialSelectedMembers: this.initialSelectedMembers,
      title: this.title,
      maxAllowedMembers: this.maxAllowedMembers,
      onUpdateSelectedMembers: (members) => {
        console.log('final selected, active members', members);
      },
    });
  };
}
