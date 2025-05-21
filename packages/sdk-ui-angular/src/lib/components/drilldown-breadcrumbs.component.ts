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
  DrilldownBreadcrumbs as DrilldownBreadcrumbsPreact,
  type DrilldownBreadcrumbsProps as DrilldownBreadcrumbsPropsPreact,
} from '@sisense/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
  rootId,
  styles,
  template,
} from '../component-wrapper-helpers';
import { SisenseContextService } from '../services/sisense-context.service';
import { ThemeService } from '../services/theme.service';
import type { Arguments, ArgumentsAsObject } from '../types/utility-types';

/**
 * Props of the {@link DrilldownBreadcrumbsComponent}.
 */
export interface DrilldownBreadcrumbsProps
  extends Omit<DrilldownBreadcrumbsPropsPreact, 'clearDrilldownSelections'> {
  drilldownSelectionsClear?: () => void;
  drilldownSelectionsSlice?: (event: {
    i: Arguments<DrilldownBreadcrumbsPropsPreact['sliceDrilldownSelections']>[0];
  }) => void;
}

/**
 * Drilldown Breadcrumbs Component
 *
 * @group Drilldown
 */
@Component({
  selector: 'csdk-drilldown-breadcrumbs',
  template,
  styles,
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
    ArgumentsAsObject<DrilldownBreadcrumbsPropsPreact['clearDrilldownSelections'], []>
  >();

  /**
   * {@inheritDoc @sisense/sdk-ui!DrilldownBreadcrumbsProps.sliceDrilldownSelections}
   *
   * @category Widget
   */
  @Output()
  drilldownSelectionsSlice = new EventEmitter<
    Arguments<DrilldownBreadcrumbsPropsPreact['sliceDrilldownSelections']>[0]
  >();

  private componentAdapter: ComponentAdapter<typeof DrilldownBreadcrumbsPreact>;

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
    this.componentAdapter = new ComponentAdapter(DrilldownBreadcrumbsPreact, [
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

  private getPreactComponentProps(): DrilldownBreadcrumbsPropsPreact {
    return {
      filtersDisplayValues: this.filtersDisplayValues,
      currentDimension: this.currentDimension,
      clearDrilldownSelections: () => this.drilldownSelectionsClear.emit(),
      sliceDrilldownSelections: (
        i: Arguments<DrilldownBreadcrumbsProps['sliceDrilldownSelections']>[0],
      ) => this.drilldownSelectionsSlice.emit(i),
    };
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
