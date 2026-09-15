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
  Table as TablePreact,
  type TableProps as TablePropsPreact,
} from '@sisense/sdk-ui-preact';

import {
  createPluginContextConnector,
  createSisenseContextConnector,
  createThemeContextConnector,
  rootId,
  styles,
  template,
} from '../../component-wrapper-helpers';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import { BaseChartEventProps, WithoutPreactChartEventProps } from '../../types';

/**
 * Props of the {@link TableComponent}.
 */
export interface TableProps
  extends WithoutPreactChartEventProps<TablePropsPreact>,
    BaseChartEventProps {}
/**
 * Table with aggregation and pagination.
 *
 * @example
 * ```ts
 * import { Component } from '@angular/core';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * @Component({
 *   selector: 'code-example',
 *   template: `
 *     <csdk-table
 *       [dataSet]="DM.DataSource"
 *       [dataOptions]="dataOptions"
 *       [styleOptions]="styleOptions"
 *     ></csdk-table>
 *   `,
 * })
 * export class CodeExample {
 *   DM = DM;
 *   dataOptions = {
 *     columns: [
 *       { column: DM.Commerce.Date.Years, name: 'Year', dateFormat: 'yyyy' },
 *       DM.Commerce.Condition,
 *       measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *     ],
 *   };
 *   styleOptions = {
 *     rowsPerPage: 12,
 *     height: 420,
 *     header: { color: { enabled: true, backgroundColor: '#94F5F0', textColor: '#121A23' } },
 *     rows: { alternatingColor: { enabled: true, backgroundColor: '#f2f2f2' } },
 *   };
 * }
 * ```
 * <img src="media://table-example-1.png" width="700px" />
 * @group Data Grids
 */
@Component({
  standalone: false,
  selector: 'csdk-table',
  template,
  styles,
})
export class TableComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** @internal */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!TableProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: TableProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TableProps.dataOptions}
   *
   * @category Data
   */
  @Input()
  dataOptions!: TableProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TableProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: TableProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TableProps.styleOptions}
   *
   * @category Representation
   */
  @Input()
  styleOptions: TableProps['styleOptions'];

  /**
   * {@inheritDoc  @sisense/sdk-ui!TableProps.onDataReady}
   *
   * @category Callbacks
   */
  @Input()
  dataReady: TableProps['dataReady'];

  private componentAdapter: ComponentAdapter<typeof TablePreact>;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(TablePreact, [
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

  private getPreactComponentProps(): TablePropsPreact {
    return {
      dataSet: this.dataSet,
      dataOptions: this.dataOptions,
      filters: this.filters,
      styleOptions: this.styleOptions,
      onDataReady: this.dataReady,
    };
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
