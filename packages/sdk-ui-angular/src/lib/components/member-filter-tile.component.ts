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
  MemberFilterTile,
  type MemberFilterTileProps,
  ComponentAdapter,
  createElement,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from '../services/sisense-context.service';
import { ThemeService } from '../services/theme.service';
import type { Arguments, ArgumentsAsObject } from '../utility-types';
import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../component-wrapper-helpers';
import { template, rootId } from '../component-wrapper-helpers/template';

/**
 * Member Filter Tile Component
 */
@Component({
  selector: 'csdk-member-filter-tile',
  template,
})
export class MemberFilterTileComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.title}
   */
  @Input()
  title!: MemberFilterTileProps['title'];

  /**
   * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.dataSource}
   */
  @Input()
  dataSource: MemberFilterTileProps['dataSource'];

  /**
   * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.attribute}
   */
  @Input()
  attribute!: MemberFilterTileProps['attribute'];

  /**
   * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.filter}
   */
  @Input()
  filter!: MemberFilterTileProps['filter'];

  /**
   * {@inheritDoc @sisense/sdk-ui!MemberFilterTileProps.onChange}
   */
  @Output()
  filterChange = new EventEmitter<
    ArgumentsAsObject<MemberFilterTileProps['onChange'], ['filter']>
  >();

  private componentAdapter: ComponentAdapter;

  /**
   * Constructor for the `MemberFilterTileComponent`.
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
    this.componentAdapter = new ComponentAdapter(
      () => this.createPreactComponent(),
      [
        createSisenseContextConnector(this.sisenseContextService),
        createThemeContextConnector(this.themeService),
      ],
    );
  }

  /**
   * @internal
   */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement);
  }

  /**
   * @internal
   */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement);
    }
  }

  private createPreactComponent() {
    const props = {
      title: this.title,
      dataSource: this.dataSource,
      attribute: this.attribute,
      filter: this.filter,
      onChange: (...[filter]: Arguments<MemberFilterTileProps['onChange']>) =>
        this.filterChange.emit({ filter }),
    };

    return createElement(MemberFilterTile, props);
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
