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
  MemberFilterTile as MemberFilterTilePreact,
  type MemberFilterTileProps as MemberFilterTilePropsPreact,
} from '@sisense/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../../component-wrapper-helpers';
import { rootId, template } from '../../component-wrapper-helpers/template';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import type { Arguments, ArgumentsAsObject } from '../../types/utility-types';

/**
 * Props of the {@link MemberFilterTileComponent}.
 */
export interface MemberFilterTileProps extends Omit<MemberFilterTilePropsPreact, 'onChange'> {
  filterChange?: (filter: Arguments<MemberFilterTilePropsPreact['onChange']>[0]) => void;
}

/**
 * Member Filter Tile Component
 *
 * @example
 * ```html
 *     <csdk-member-filter-tile
 *       title="Years Filter"
 *       [attribute]="DM.ER.Date.Years"
 *       [filter]="memberFilterTileProps.yearFilter"
 *       (filterChange)="memberFilterTileProps.setYearFilter($event)"
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
 *   memberFilterTileProps = {
 *     yearFilter: filterFactory.members(DM.ER.Date.Years, ['2013-01-01T00:00:00']),
 *     setYearFilter({ filter }: { filter: Filter | null }) {
 *       if (filter) {
 *         this.yearFilter = filter;
 *       }
 *     },
 *   };
 * }
 * ```
 * <img src="media://angular-member-filter-tile-example.png" width="225px" />
 * @group Filter Tiles
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
    ArgumentsAsObject<MemberFilterTilePropsPreact['onChange'], ['filter']>
  >();

  private componentAdapter: ComponentAdapter<typeof MemberFilterTilePreact>;

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
    this.componentAdapter = new ComponentAdapter(MemberFilterTilePreact, [
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

  private getPreactComponentProps(): MemberFilterTilePropsPreact {
    return {
      title: this.title,
      dataSource: this.dataSource,
      attribute: this.attribute,
      filter: this.filter,
      onChange: (...[filter]: Arguments<MemberFilterTilePropsPreact['onChange']>) =>
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
