import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  ComponentAdapter,
  PivotTable as PivotTablePreact,
  type PivotTableProps as PivotTablePropsPreact,
} from '@sisense/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
  rootId,
  styles,
  template,
} from '../../component-wrapper-helpers';
import { SisenseContextService } from '../../services';
import { ThemeService } from '../../services';

/**
 * Props of the {@link PivotTableComponent}.
 */
export interface PivotTableProps extends PivotTablePropsPreact {}

/**
 * Pivot Table with and pagination.
 *
 * @example
 * ```html
 *  <csdk-pivot-table
 *    [dataSet]="pivotTable.dataSet"
 *    [dataOptions]="pivotTable.dataOptions"
 *    [filters]="pivotTable.filters"
 *    [styleOptions]="pivotTable.styleOptions"
 *  />
 * ```
 * ```ts
import { Component } from '@angular/core';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from '../../assets/sample-ecommerce';
import type { PivotTableDataOptions } from '@sisense/sdk-ui-angular';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {

  pivotTableDataOptions: PivotTableDataOptions = {
    rows: [
      { column: DM.Category.Category, includeSubTotals: true },
      { column: DM.Commerce.AgeRange, includeSubTotals: true },
      DM.Commerce.Condition,
    ],
    columns: [{ column: DM.Commerce.Gender, includeSubTotals: true }],
    values: [
      measureFactory.sum(DM.Commerce.Cost, 'Total Cost'),
      {
        column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
        totalsCalculation: 'sum',
        dataBars: true,
      },
    ],
    grandTotals: { title: 'Grand Total', rows: true, columns: true },
  };

  pivotTable = {
    dataSet: DM.DataSource,
    dataOptions: this.pivotTableDataOptions,
    filters: [filterFactory.members(DM.Commerce.Gender, ['Female', 'Male'])],
    styleOptions: { width: 1400, height: 600, rowsPerPage: 50 },
  };

}
 * ```
 * <img src="media://angular-pivot-table-example.png" width="800px" />
 * @group Data Grids
 * @beta
 */
@Component({
  selector: 'csdk-pivot-table',
  template,
  styles,
})
export class PivotTableComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** @internal */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!PivotTableProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: PivotTableProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PivotTableProps.dataOptions}
   *
   * @category Data
   */
  @Input()
  dataOptions!: PivotTableProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PivotTableProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: PivotTableProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PivotTableProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: PivotTableProps['highlights'];

  /**
   * {@inheritDoc @sisense/sdk-ui!PivotTableProps.styleOptions}
   *
   * @category Representation
   */
  @Input()
  styleOptions: PivotTableProps['styleOptions'];

  private componentAdapter: ComponentAdapter<typeof PivotTablePreact>;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(PivotTablePreact, [
      createSisenseContextConnector(this.sisenseContextService),
      createThemeContextConnector(this.themeService),
    ]);
  }

  /** @internal */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
  }

  /** @internal */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
    }
  }

  private getPreactComponentProps(): PivotTablePropsPreact {
    return {
      dataSet: this.dataSet,
      dataOptions: this.dataOptions,
      filters: this.filters,
      highlights: this.highlights,
      styleOptions: this.styleOptions,
    };
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
