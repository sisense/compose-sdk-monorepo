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
  FilterTile as FilterTilePreact,
  type FilterTileProps as FilterTilePropsPreact,
} from '@ethings-os/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
  rootId,
  styles,
  template,
} from '../../component-wrapper-helpers';
import { EventEmitterWithHasListeners } from '../../helpers';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import type {
  Arguments,
  BaseFilterTileEventProps,
  FilterChangeEvent,
  FilterEditEvent,
} from '../../types';

/**
 * Props of the {@link FilterTileComponent}.
 */
export interface FilterTileProps
  extends Omit<FilterTilePropsPreact, 'onChange' | 'onEdit' | 'onDelete'>,
    BaseFilterTileEventProps {}

/**
 * UI component that renders a filter tile based on filter type
 *
 * @example
 * Here’s how to render a filter model as a filter tile.
 *
 * ```html
<!--Component HTML template in example.component.html-->
<csdk-filter-tile
  [filter]="filterTileProps.filter"
  (filterChange)="filterTileProps.filterChange($event)"
/>
 * ```
 *
 * ```ts
// Component behavior in example.component.ts
import { Component } from '@angular/core';
import { type FilterTileProps } from '@ethings-os/sdk-ui-angular';
import { filterFactory } from '@ethings-os/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';

@Component({
  selector: 'example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
  filterTileProps: FilterTileProps = {
    filter: filterFactory.members(DM.ER.Date.Years, ['2013-01-01T00:00:00']),
    filterChange({ filter }) {
      if (filter) {
        this.filter = filter;
      }
    },
  };
}
 * ```
 * <img src="media://angular-member-filter-tile-example.png" width="225px" />
 * @group Filter Tiles
 * @shortDescription Facade component rendering a filter tile based on filter type
 */
@Component({
  selector: 'csdk-filter-tile',
  template,
  styles,
})
export class FilterTileComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @ethings-os/sdk-ui!FilterTileProps.filter}
   */
  @Input()
  filter!: FilterTileProps['filter'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!FilterTileProps.defaultDataSource}
   */
  @Input()
  defaultDataSource: FilterTileProps['defaultDataSource'];

  /**
   * {@inheritDoc FilterTileProps.filterChange}
   */
  @Output()
  filterChange = new EventEmitter<FilterChangeEvent>();

  /**
   * {@inheritDoc FilterTileProps.filterEdit}
   */
  @Output()
  filterEdit: EventEmitter<FilterEditEvent> = new EventEmitterWithHasListeners<FilterEditEvent>();

  /**
   * {@inheritDoc FilterTileProps.filterDelete}
   */
  @Output()
  filterDelete: EventEmitter<void> = new EventEmitterWithHasListeners();

  private componentAdapter: ComponentAdapter<typeof FilterTilePreact>;

  /**
   * Constructor for the `FilterTileComponent`.
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
    this.componentAdapter = new ComponentAdapter(FilterTilePreact, [
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

  private getPreactComponentProps(): FilterTilePropsPreact {
    const hasFilterEditListeners = (this.filterEdit as EventEmitterWithHasListeners<unknown>)
      .hasListeners;
    const hasFilterDeleteListeners = (this.filterDelete as EventEmitterWithHasListeners<unknown>)
      .hasListeners;

    return {
      filter: this.filter,
      defaultDataSource: this.defaultDataSource,
      onChange: (...[filter]: Arguments<FilterTilePropsPreact['onChange']>) =>
        this.filterChange.emit({ filter }),
      ...(hasFilterEditListeners && {
        onEdit: (...[levelIndex]: Arguments<FilterTilePropsPreact['onEdit']>) =>
          this.filterEdit.emit({ levelIndex }),
      }),
      ...(hasFilterDeleteListeners && { onDelete: () => this.filterDelete.emit() }),
    };
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
