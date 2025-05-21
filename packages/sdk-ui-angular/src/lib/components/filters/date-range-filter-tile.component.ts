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
  DateRangeFilterTile as DateRangeFilterTilePreact,
  type DateRangeFilterTileProps as DateRangeFilterTilePropsPreact,
} from '@sisense/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
  rootId,
  styles,
  template,
} from '../../component-wrapper-helpers';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import type { Arguments, ArgumentsAsObject } from '../../types/utility-types';

/**
 * Props of the {@link DateRangeFilterTileComponent}.
 */
export interface DateRangeFilterTileProps extends Omit<DateRangeFilterTilePropsPreact, 'onChange'> {
  filterChange?: (filter: Arguments<DateRangeFilterTilePropsPreact['onChange']>[0]) => void;
}

/**
 * Date Range Filter Tile Component
 *
 * @example
 * ```html
 * <csdk-date-range-filter-tile
 *       [title]="dateRangeFilterTileProps.title"
 *       [attribute]="dateRangeFilterTileProps.attribute"
 *       [filter]="dateRangeFilterTileProps.filter"
 *       (filterChange)="dateRangeFilterTileProps.setFilter($event)"
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

 *   dateRangeFilterTileProps = {
 *     title: 'Range Filter',
 *     attribute: DM.ER.Date.Years,
 *     filter: filterFactory.dateRange(DM.ER.Date.Years),
 *     setFilter({ filter }: { filter: Filter | null }) {
 *       console.log(filter);
 *       if (filter) {
 *         this.filter = filter;
 *       }
 *     },
 *   };
 * }
 * ```
 * <img src="media://angular-date-range-filter-tile-example.png" width="600px" />
 * @group Filter Tiles
 */
@Component({
  selector: 'csdk-date-range-filter-tile',
  template,
  styles,
})
export class DateRangeFilterTileComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.title}
   */
  @Input()
  title!: DateRangeFilterTileProps['title'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.attribute}
   */
  @Input()
  attribute!: DateRangeFilterTileProps['attribute'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.dataSource}
   */
  @Input()
  dataSource: DateRangeFilterTileProps['dataSource'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.filter}
   */
  @Input()
  filter!: DateRangeFilterTileProps['filter'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.earliestDate}
   */
  @Input()
  earliestDate: DateRangeFilterTileProps['earliestDate'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.lastDate}
   */
  @Input()
  lastDate: DateRangeFilterTileProps['lastDate'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DateRangeFilterTileProps.onChange}
   */
  @Output()
  filterChange = new EventEmitter<
    ArgumentsAsObject<DateRangeFilterTilePropsPreact['onChange'], ['filter']>
  >();

  private componentAdapter: ComponentAdapter<typeof DateRangeFilterTilePreact>;

  /**
   * Constructor for the `DateRangeFilterTileComponent`.
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
    this.componentAdapter = new ComponentAdapter(DateRangeFilterTilePreact, [
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

  private getPreactComponentProps(): DateRangeFilterTilePropsPreact {
    return {
      title: this.title,
      attribute: this.attribute,
      dataSource: this.dataSource,
      filter: this.filter,
      earliestDate: this.earliestDate,
      lastDate: this.lastDate,
      onChange: (...[filter]: Arguments<DateRangeFilterTilePropsPreact['onChange']>) =>
        this.filterChange.emit({ filter }),
    };
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
