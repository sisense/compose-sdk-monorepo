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
  DateRangeFilterTile,
  type DateRangeFilterTileProps,
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
 * Date Range Filter Tile Component
 */
@Component({
  selector: 'csdk-date-range-filter-tile',
  template,
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
    ArgumentsAsObject<DateRangeFilterTileProps['onChange'], ['filter']>
  >();

  private componentAdapter: ComponentAdapter;

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
      attribute: this.attribute,
      dataSource: this.dataSource,
      filter: this.filter,
      earliestDate: this.earliestDate,
      lastDate: this.lastDate,
      onChange: (...[filter]: Arguments<DateRangeFilterTileProps['onChange']>) =>
        this.filterChange.emit({ filter }),
    };

    return createElement(DateRangeFilterTile, props);
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
