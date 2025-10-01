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
  FiltersPanel as FiltersPanelPreact,
  type FiltersPanelConfig,
  type FiltersPanelProps as FiltersPanelPropsPreact,
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
import type { Arguments, FiltersPanelChangeEvent } from '../../types';

/** Reexport related types */
export type { FiltersPanelConfig };

/**
 * Props of the {@link FiltersPanelComponent}.
 */
export interface FiltersPanelProps extends Omit<FiltersPanelPropsPreact, 'onFiltersChange'> {
  /**
   * Callback to handle changes in filters
   */
  filtersChange?: (event: FiltersPanelChangeEvent) => void;
}

/**
 * Filters panel component that renders a list of filter tiles
 *
 * @example
 * Here's how to render a filters panel with a set of filters.
 *
 * ```html
<!--Component HTML template in example.component.html-->
<csdk-filters-panel
  [filters]="filtersPanelProps.filters"
  [defaultDataSource]="filtersPanelProps.defaultDataSource"
  (filtersChange)="filtersPanelProps.filtersChange($event)"
/>
 * ```
 *
 * ```ts
// Component behavior in example.component.ts
import { Component } from '@angular/core';
import { type FiltersPanelProps } from '@ethings-os/sdk-ui-angular';
import { filterFactory } from '@ethings-os/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';

@Component({
  selector: 'example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
  filtersPanelProps: FiltersPanelProps = {
    filters: [
      filterFactory.members(DM.ER.Date.Years, ['2013-01-01T00:00:00']),
      filterFactory.members(DM.ER.Departments.Department, ['Cardiology']),
    ],
    defaultDataSource: DM.DataSource,
    filtersChange({ filters }) {
      this.filtersPanelProps.filters = filters;
    },
  };
}
 * ```
 * @group Filter Tiles
 */
@Component({
  selector: 'csdk-filters-panel',
  template,
  styles,
})
export class FiltersPanelComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @ethings-os/sdk-ui!FiltersPanelProps.filters}
   */
  @Input()
  filters!: FiltersPanelProps['filters'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!FiltersPanelProps.defaultDataSource}
   */
  @Input()
  defaultDataSource: FiltersPanelProps['defaultDataSource'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!FiltersPanelProps.dataSources}
   *
   * @internal
   */
  @Input()
  dataSources: FiltersPanelProps['dataSources'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!FiltersPanelProps.config}
   */
  @Input()
  config: FiltersPanelProps['config'];

  /**
   * {@inheritDoc FiltersPanelProps.filtersChange}
   */
  @Output()
  filtersChange = new EventEmitter<FiltersPanelChangeEvent>();

  private componentAdapter: ComponentAdapter<typeof FiltersPanelPreact>;

  /**
   * Constructor for the `FiltersPanelComponent`.
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
    this.componentAdapter = new ComponentAdapter(FiltersPanelPreact, [
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

  private getPreactComponentProps(): FiltersPanelPropsPreact {
    return {
      filters: this.filters,
      defaultDataSource: this.defaultDataSource,
      dataSources: this.dataSources,
      config: this.config,
      onFiltersChange: (...[filters]: Arguments<FiltersPanelPropsPreact['onFiltersChange']>) =>
        this.filtersChange.emit({ filters }),
    };
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
