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
  RelativeDateFilterTile,
  type RelativeDateFilterTileProps as RelativeDateFilterTilePropsPreact,
  ComponentAdapter,
  createElement,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import type { Arguments, ArgumentsAsObject } from '../../types/utility-types';
import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../../component-wrapper-helpers';
import { template, rootId } from '../../component-wrapper-helpers/template';

export interface RelativeDateFilterTileProps
  extends Omit<RelativeDateFilterTilePropsPreact, 'onUpdate'> {
  filterChange?: (filter: Arguments<RelativeDateFilterTilePropsPreact['onUpdate']>[0]) => void;
}

/**
 * Relative Date Filter Tile Component
 *
 * @example
 * ```html
 * <csdk-relative-date-filter-tile
 *       [title]="relativeDateFilterTileProps.title"
 *       [arrangement]="relativeDateFilterTileProps.arrangement"
 *       [filter]="relativeDateFilterTileProps.filter"
 *       (filterChange)="relativeDateFilterTileProps.setFilter($event)"
 *     />
 * ```
 * ```ts
 * import { Component } from '@angular/core';
 * import { Filter, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../../assets/sample-healthcare-model';
 *
 * @Component({
 *   selector: 'app-filters',
 *   templateUrl: './filters.component.html',
 *   styleUrls: ['./filters.component.scss'],
 * })
 * export class FiltersComponent {
 *   DM = DM;
 *
 *   relativeDateFilterTileProps = {
 *     title: 'Relative Date Filter',
 *     arrangement: 'vertical',
 *     filter: filterFactory.dateRelativeTo(DM.ER.Date.Days, 0, 150),
 *     setFilter({ filter }: { filter: Filter | null }) {
 *       console.log(filter);
 *       if (filter) {
 *         this.filter = filter;
 *       }
 *     },
 *   };
 * }
 * ```
 * <img src="media://angular-relative-date-filter-tile-example.png" width="600px" />
 * @group Filter Tiles
 */
@Component({
  selector: 'csdk-relative-date-filter-tile',
  template,
})
export class RelativeDateFilterTileComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.title}
   */
  @Input()
  title!: RelativeDateFilterTileProps['title'];

  /**
   * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.filter}
   */
  @Input()
  filter!: RelativeDateFilterTileProps['filter'];

  /**
   * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.arrangement}
   */
  @Input()
  arrangement: RelativeDateFilterTileProps['arrangement'];

  /**
   * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.limit}
   */
  @Input()
  limit: RelativeDateFilterTileProps['limit'];

  /**
   * {@inheritDoc @sisense/sdk-ui!RelativeDateFilterTileProps.onUpdate}
   */
  @Output()
  filterChange = new EventEmitter<
    ArgumentsAsObject<RelativeDateFilterTilePropsPreact['onUpdate'], ['filter']>
  >();

  private componentAdapter: ComponentAdapter;

  /**
   * Constructor for the `RelativeDateFilterTileComponent`.
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
      filter: this.filter,
      arrangement: this.arrangement,
      limit: this.limit,
      onUpdate: (...[filter]: Arguments<RelativeDateFilterTilePropsPreact['onUpdate']>) =>
        this.filterChange.emit({ filter }),
    };

    return createElement(RelativeDateFilterTile, props);
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
