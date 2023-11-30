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
  DrilldownBreadcrumbs,
  type DrilldownBreadcrumbsProps,
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
 * Drilldown Breadcrumbs Component
 */
@Component({
  selector: 'csdk-drilldown-breadcrumbs',
  template,
})
export class DrilldownBreadcrumbsComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!DrilldownBreadcrumbsProps.filtersDisplayValues}
   *
   * @category Widget
   */
  @Input()
  filtersDisplayValues!: DrilldownBreadcrumbsProps['filtersDisplayValues'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DrilldownBreadcrumbsProps.currentDimension}
   *
   * @category Widget
   */
  @Input()
  currentDimension!: DrilldownBreadcrumbsProps['currentDimension'];

  /**
   * {@inheritDoc @sisense/sdk-ui!DrilldownBreadcrumbsProps.clearDrilldownSelections}
   *
   * @category Widget
   */
  @Output()
  drilldownSelectionsClear = new EventEmitter<
    ArgumentsAsObject<DrilldownBreadcrumbsProps['clearDrilldownSelections'], []>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!DrilldownBreadcrumbsProps.sliceDrilldownSelections}
   *
   * @category Widget
   */
  @Output()
  drilldownSelectionsSlice = new EventEmitter<
    Arguments<DrilldownBreadcrumbsProps['sliceDrilldownSelections']>[0]
  >();

  private componentAdapter: ComponentAdapter;

  /**
   * Constructor for the `DrilldownBreadcrumbsComponent`.
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
      filtersDisplayValues: this.filtersDisplayValues,
      currentDimension: this.currentDimension,
      clearDrilldownSelections: () => this.drilldownSelectionsClear.emit(),
      sliceDrilldownSelections: (
        i: Arguments<DrilldownBreadcrumbsProps['sliceDrilldownSelections']>[0],
      ) => this.drilldownSelectionsSlice.emit(i),
    };

    return createElement(DrilldownBreadcrumbs, props);
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
