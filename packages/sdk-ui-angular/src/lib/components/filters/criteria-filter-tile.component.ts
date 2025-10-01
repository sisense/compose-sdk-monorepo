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
  CriteriaFilterTile as CriteriaFilterTilePreact,
  type CriteriaFilterTileProps as CriteriaFilterTilePropsPreact,
} from '@ethings-os/sdk-ui-preact';

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
 * Props of the {@link CriteriaFilterTileComponent}.
 */
export interface CriteriaFilterTileProps extends Omit<CriteriaFilterTilePropsPreact, 'onUpdate'> {
  filterChange?: (filter: Arguments<CriteriaFilterTilePropsPreact['onUpdate']>[0]) => void;
}

/**
 * Criteria Filter Tile Component
 *
 * @example
 * ```html
 *     <csdk-criteria-filter-tile
 *       [title]="criteriaFilterTileProps.title"
 *       [filter]="criteriaFilterTileProps.filter"
 *       (filterChange)="criteriaFilterTileProps.setFilter($event)"
 *     />
 * ```
 * ```ts
 * import { Component } from '@angular/core';
 * import { Filter, filterFactory } from '@ethings-os/sdk-data';
 * import * as DM from '../../assets/sample-healthcare-model';
 *
 * @Component({
 *   selector: 'app-filters',
 *   templateUrl: './filters.component.html',
 *   styleUrls: ['./filters.component.scss'],
 * })
 * export class FiltersComponent {
 *   DM = DM;
 *   title: 'Room Number',
 *   filter: filterFactory.lessThan(DM.Rooms.Room_number, 200) ,
 *   setFilter({ filter }: { filter: Filter | null }) {
 *     console.log(filter);
 *     if (filter) {
 *       this.filter = filter ;
 *     }
 *   },
 * }
 * ```
 * <img src="media://angular-criteria-filter-tile-example.png" width="400px" />
 * @group Filter Tiles
 */
@Component({
  selector: 'csdk-criteria-filter-tile',
  template,
  styles,
})
export class CriteriaFilterTileComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CriteriaFilterTileProps.title}
   */
  @Input()
  title!: CriteriaFilterTileProps['title'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CriteriaFilterTileProps.filter}
   */
  @Input()
  filter!: CriteriaFilterTileProps['filter'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CriteriaFilterTileProps.arrangement}
   */
  @Input()
  arrangement: CriteriaFilterTileProps['arrangement'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CriteriaFilterTileProps.measures}
   */
  @Input()
  measures: CriteriaFilterTileProps['measures'];

  /** @internal */
  @Input()
  tileDesignOptions: CriteriaFilterTileProps['tileDesignOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!CriteriaFilterTileProps.onUpdate}
   */
  @Output()
  filterChange = new EventEmitter<
    ArgumentsAsObject<CriteriaFilterTilePropsPreact['onUpdate'], ['filter']>
  >();

  private componentAdapter: ComponentAdapter<typeof CriteriaFilterTilePreact>;

  /**
   * Constructor for the `CriteriaFilterTileComponent`.
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
    this.componentAdapter = new ComponentAdapter(CriteriaFilterTilePreact, [
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

  private getPreactComponentProps(): CriteriaFilterTilePropsPreact {
    return {
      title: this.title,
      filter: this.filter,
      arrangement: this.arrangement,
      measures: this.measures,
      tileDesignOptions: this.tileDesignOptions,
      onUpdate: (...[filter]: Arguments<CriteriaFilterTilePropsPreact['onUpdate']>) =>
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
