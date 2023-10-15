import { AfterViewInit } from '@angular/core';
import { OnChanges } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {
  BasicMemberFilterTile,
  BasicMemberFilterTileProps,
  ComponentAdapter,
  createElement,
} from '@sisense/sdk-ui-preact';
import type { Arguments } from '../utility-types';

/**
 * Filter Tile Component
 */
@Component({
  selector: 'csdk-basic-member-filter-tile',
  template: `<div #preact></div>`,
})
export class BasicMemberFilterTileComponent implements AfterViewInit, OnChanges, OnDestroy {
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

  @Output('selectedMembersUpdated')
  selectedMembersUpdated = new EventEmitter<
    Arguments<BasicMemberFilterTileProps['onUpdateSelectedMembers']>[0]
  >();

  private componentAdapter: ComponentAdapter;

  constructor() {
    this.componentAdapter = new ComponentAdapter(() => this.createPreactComponent());
  }

  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement);
  }

  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement);
    }
  }

  ngOnDestroy() {
    this.componentAdapter.destroy();
  }

  private createPreactComponent() {
    const props = {
      allMembers: this.allMembers,
      initialSelectedMembers: this.initialSelectedMembers,
      title: this.title,
      maxAllowedMembers: this.maxAllowedMembers,
      onUpdateSelectedMembers: (
        members: Arguments<BasicMemberFilterTileProps['onUpdateSelectedMembers']>[0],
      ) => this.selectedMembersUpdated.emit(members),
    };

    return createElement(BasicMemberFilterTile, props);
  }
}
