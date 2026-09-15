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
  PivotTable as PivotTablePreact,
  type PivotTableProps as PivotTablePropsPreact,
} from '@sisense/sdk-ui-preact';

import {
  createPluginContextConnector,
  createSisenseContextConnector,
  createThemeContextConnector,
  rootId,
  styles,
  template,
} from '../../component-wrapper-helpers';
import { SisenseContextService } from '../../services';
import { ThemeService } from '../../services';
import type {
  Arguments,
  PivotTableDataPointEvent,
  PivotTableEventProps,
  WithoutPreactChartEventProps,
} from '../../types';

/**
 * Props of the {@link PivotTableComponent}.
 */
export interface PivotTableProps
  extends WithoutPreactChartEventProps<PivotTablePropsPreact>,
    PivotTableEventProps {}

/**
 * Pivot Table with and pagination.
 *
 * @example
 * ```ts
 * import { Component } from '@angular/core';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-pivot-table
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-pivot-table>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     rows: [
 *       {
 *         column: DM.Commerce.Date.Years,
 *         dateFormat: 'yyyy',
 *         name: 'Year',
 *       },
 *       DM.Commerce.Condition,
 *     ],
 *     columns: [DM.Commerce.AgeRange],
 *     values: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *   };
 *   styleOptions = {
 *     rowsPerPage: 10,
 *     height: 425,
 *     width: 800,
 *   };
 * }
 * ```
 *
 * <img src="media://pivot-table-example-1.png" width="800px" />
 *
 * Additional examples:
 *
 * Highlighting relative magnitude within a column with data bars:
 * ```ts
 * import { Component } from '@angular/core';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-pivot-table
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-pivot-table>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     rows: [DM.Commerce.Condition, DM.Commerce.AgeRange],
 *     columns: [
 *       {
 *         column: DM.Commerce.Date.Years,
 *         dateFormat: 'yyyy',
 *         name: 'Year',
 *       },
 *     ],
 *     values: [
 *       {
 *         column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *         dataBars: true,
 *       },
 *     ],
 *   };
 *   styleOptions = {
 *     rowsPerPage: 10,
 *     height: 425,
 *     width: 850,
 *   };
 * }
 * ```
 *
 * <img src="media://pivot-table-example-2.png" width="800px" />
 *
 * Sorting rows: `Condition` and `Age Range` rows sorted directly by their own values (equivalent to a user clicking a row heading and choosing Sort Descending):
 * ```ts
 * import { Component } from '@angular/core';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-pivot-table
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-pivot-table>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     rows: [
 *       {
 *         column: DM.Commerce.Condition,
 *         sortType: 'sortDesc',
 *       },
 *       {
 *         column: DM.Commerce.AgeRange,
 *         sortType: 'sortDesc',
 *       },
 *     ],
 *     columns: [{ column: DM.Commerce.Date.Years }],
 *     values: [
 *       { column: measureFactory.sum(DM.Commerce.Revenue, 'Revenue') },
 *       { column: measureFactory.sum(DM.Commerce.Quantity, 'Units') },
 *     ],
 *   };
 *   styleOptions = {
 *     rowsPerPage: 12,
 *     height: 425,
 *     width: 1200,
 *   };
 * }
 * ```
 *
 * <img src="media://pivot-table-example-3.png" width="800px" />
 *
 * Sorting rows by a value column: `Age Range` sorted by its `Revenue` values (equivalent to a user clicking the `Revenue` value heading and sorting `Age Range` Descending):
 * ```ts
 * import { Component } from '@angular/core';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-pivot-table
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-pivot-table>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     rows: [
 *       DM.Commerce.Condition,
 *       {
 *         column: DM.Commerce.AgeRange,
 *         sortType: {
 *           direction: 'sortDesc',
 *           by: {
 *             valuesIndex: 0,
 *           },
 *         },
 *       },
 *     ],
 *     values: [
 *       measureFactory.sum(DM.Commerce.Revenue, 'Revenue'),
 *       measureFactory.sum(DM.Commerce.Quantity, 'Units'),
 *     ],
 *   };
 *   styleOptions = {
 *     rowsPerPage: 12,
 *     height: 425,
 *     width: 800,
 *   };
 * }
 * ```
 *
 * <img src="media://pivot-table-example-4.png" width="800px" />
 *
 * Grand totals across rows and columns:
 * ```ts
 * import { Component } from '@angular/core';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-pivot-table
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-pivot-table>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     rows: [
 *       {
 *         column: DM.Commerce.Date.Years,
 *         dateFormat: 'yyyy',
 *         name: 'Year',
 *       },
 *       DM.Commerce.Condition,
 *     ],
 *     columns: [DM.Commerce.AgeRange],
 *     values: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     grandTotals: {
 *       rows: true,
 *       columns: true,
 *     },
 *   };
 *   styleOptions = {
 *     rowsPerPage: 15,
 *     height: 550,
 *     width: 900,
 *     totalsColor: true,
 *     headersColor: true,
 *   };
 * }
 * ```
 *
 * <img src="media://pivot-table-example-5.png" width="800px" />
 *
 * Grand totals plus a subtotal row per `Year`, via {@link PivotTableDataOptions.rows}' `includeSubTotals`:
 * ```ts
 * import { Component } from '@angular/core';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-pivot-table
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-pivot-table>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     rows: [
 *       {
 *         column: DM.Commerce.Date.Years,
 *         dateFormat: 'yyyy',
 *         name: 'Year',
 *         includeSubTotals: true,
 *       },
 *       DM.Commerce.Condition,
 *     ],
 *     columns: [DM.Commerce.AgeRange],
 *     values: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     grandTotals: {
 *       rows: true,
 *       columns: true,
 *     },
 *   };
 *   styleOptions = {
 *     rowsPerPage: 15,
 *     height: 550,
 *     width: 900,
 *     totalsColor: true,
 *     headersColor: true,
 *   };
 * }
 * ```
 *
 * <img src="media://pivot-table-example-6.png" width="800px" />
 *
 * @remarks
 * Configuration options can also be applied within the scope of a `<SisenseContextProvider>` to control the default behavior of PivotTable, by changing available settings within `appConfig.chartConfig.tabular.*`
 *
 * Follow the link to {@link AppConfig} for more details on the available settings.
 *
 * @group Data Grids
 */
@Component({
  standalone: false,
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

  /**
   * {@inheritDoc @sisense/sdk-ui!PivotTableProps.onDataPointClick}
   *
   * @category Callbacks
   */
  @Output()
  dataPointClick = new EventEmitter<PivotTableDataPointEvent>();

  /**
   * {@inheritDoc @sisense/sdk-ui!PivotTableProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  @Output()
  dataPointContextMenu = new EventEmitter<PivotTableDataPointEvent>();

  private componentAdapter: ComponentAdapter<typeof PivotTablePreact>;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(PivotTablePreact, [
      createPluginContextConnector(this.sisenseContextService),
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
      onDataPointClick: (
        ...[point, nativeEvent]: Arguments<PivotTablePropsPreact['onDataPointClick']>
      ) => this.dataPointClick.emit({ point, nativeEvent } as PivotTableDataPointEvent),
      onDataPointContextMenu: (
        ...[point, nativeEvent]: Arguments<PivotTablePropsPreact['onDataPointContextMenu']>
      ) => this.dataPointContextMenu.emit({ point, nativeEvent } as PivotTableDataPointEvent),
    };
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
