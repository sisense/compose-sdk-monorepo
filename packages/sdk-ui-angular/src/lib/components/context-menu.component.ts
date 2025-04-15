import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ComponentAdapter,
  ContextMenu as ContextMenuPreact,
  type ContextMenuProps,
  createWrapperElement,
} from '@sisense/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../component-wrapper-helpers';
import { rootContentId, rootId, templateWithContent } from '../component-wrapper-helpers/template';
import { SisenseContextService } from '../services/sisense-context.service';
import { ThemeService } from '../services/theme.service';
import type { ArgumentsAsObject } from '../types/utility-types';

/**
 * Context Menu Component
 *
 * @group Drilldown
 */
@Component({
  selector: 'csdk-context-menu',
  template: templateWithContent,
})
export class ContextMenuComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * @internal
   */
  @ViewChild(rootContentId)
  preactContentRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!ContextMenuProps.position}
   */
  @Input()
  position: ContextMenuProps['position'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ContextMenuProps.itemSections}
   */
  @Input()
  itemSections: ContextMenuProps['itemSections'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ContextMenuProps.closeContextMenu}
   */
  @Output()
  contextMenuClose = new EventEmitter<
    ArgumentsAsObject<ContextMenuProps['closeContextMenu'], []>
  >();

  private componentAdapter: ComponentAdapter<typeof ContextMenuPreact>;

  /**
   * Constructor for the `ContextMenuComponent`.
   *
   * @param sisenseContextService - Sisense context service
   * @param themeService - Theme service
   */
  constructor(
    /**
     * Sisense context service
     *
     * @category Constructor
     */
    public sisenseContextService: SisenseContextService,
    /**
     * Theme service
     *
     * @category Constructor
     */
    public themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(ContextMenuPreact, [
      createSisenseContextConnector(this.sisenseContextService),
      createThemeContextConnector(this.themeService),
    ]);
  }

  /**
   * @internal
   */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
  }

  /**
   * @internal
   */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
    }
  }

  private getPreactComponentProps(): ContextMenuProps {
    return {
      position: this.position,
      itemSections: this.itemSections,
      closeContextMenu: () => this.contextMenuClose.emit(),
      children: createWrapperElement(this.preactContentRef.nativeElement),
    };
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
