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
import type { Arguments } from '../types/utility-types';
import { template, rootId } from '../component-wrapper-helpers/template';

/**
 * Basic Member Filter Tile Component
 *
 * @internal
 */
@Component({
  selector: 'csdk-basic-member-filter-tile',
  template,
})
export class BasicMemberFilterTileComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** @internal */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  @Input()
  title!: BasicMemberFilterTileProps['title'];

  @Input()
  allMembers!: BasicMemberFilterTileProps['allMembers'];

  @Input()
  initialSelectedMembers: BasicMemberFilterTileProps['initialSelectedMembers'];

  @Input()
  maxAllowedMembers: BasicMemberFilterTileProps['maxAllowedMembers'];

  @Output()
  selectedMembersUpdated = new EventEmitter<
    Arguments<BasicMemberFilterTileProps['onUpdateSelectedMembers']>[0]
  >();

  private componentAdapter: ComponentAdapter;

  constructor() {
    this.componentAdapter = new ComponentAdapter(() => this.createPreactComponent());
  }

  /** @internal */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement);
  }

  /** @internal */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement);
    }
  }

  /** @internal */
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
