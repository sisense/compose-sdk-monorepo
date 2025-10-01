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
  PivotTableWidget as PivotTableWidgetPreact,
  type PivotTableWidgetProps as PivotTableWidgetPropsPreact,
} from '@ethings-os/sdk-ui-preact';

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
 * Props of the {@link PivotTableWidgetComponent}.
 */
export interface PivotTableWidgetProps
  extends Omit<PivotTableWidgetPropsPreact, 'onDataPointClick' | 'onDataPointContextMenu'> {}

/**
 * The Pivot Table Widget component extends the {@link PivotTableComponent} component to support widget features,
 * including a header, widget style options, and more.
 *
 * @example
 * ```html
<csdk-pivot-table-widget
  [dataSource]="pivotProps.dataSource"
  [dataOptions]="pivotProps.dataOptions"
  [filters]="pivotProps.filters"
  [styleOptions]="pivotProps.styleOptions"
  [title]="pivotProps.title"
  [description]="pivotProps.description"
/>
 * ```
 * ```ts
import { Component } from '@angular/core';
import { type PivotTableWidgetProps } from '@ethings-os/sdk-ui-angular';
import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
import * as DM from '../../assets/sample-ecommerce';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {

  pivotProps: PivotTableWidgetProps = {
    dataSource: DM.DataSource,
    dataOptions: {
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
    },
    filters: [filterFactory.members(DM.Commerce.Gender, ['Female', 'Male'])],
    styleOptions: { width: 1400, height: 600, rowsPerPage: 25 },
    title: 'Pivot Table Widget',
    description: 'Pivot Table Widget Description',
  };
}
 * ```
 * <img src="media://angular-pivot-table-widget-example.png" width="800px" />
 * @group Dashboards
 * @beta
 */
@Component({
  selector: 'csdk-pivot-table-widget',
  template,
  styles,
})
export class PivotTableWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** @internal */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @ethings-os/sdk-ui!PivotTableWidgetProps.dataSource}
   *
   * @category Data
   */
  @Input()
  dataSource: PivotTableWidgetProps['dataSource'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!PivotTableWidgetProps.dataOptions}
   *
   * @category Data
   */
  @Input()
  dataOptions!: PivotTableWidgetProps['dataOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!PivotTableWidgetProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: PivotTableWidgetProps['filters'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!PivotTableWidgetProps.highlights}
   *
   * @category Data
   */
  @Input()
  highlights: PivotTableWidgetProps['highlights'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!PivotTableWidgetProps.styleOptions}
   *
   * @category Representation
   */
  @Input()
  styleOptions: PivotTableWidgetProps['styleOptions'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!PivotTableWidgetProps.title}
   *
   * @category Widget
   */
  @Input()
  title: PivotTableWidgetProps['title'];

  /**
   * {@inheritDoc @ethings-os/sdk-ui!PivotTableWidgetProps.title}
   *
   * @category Widget
   */
  @Input()
  description: PivotTableWidgetProps['description'];

  private componentAdapter: ComponentAdapter<typeof PivotTableWidgetPreact>;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(PivotTableWidgetPreact, [
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

  private getPreactComponentProps(): PivotTableWidgetPropsPreact {
    return {
      dataSource: this.dataSource,
      dataOptions: this.dataOptions,
      filters: this.filters,
      highlights: this.highlights,
      styleOptions: this.styleOptions,
      title: this.title,
      description: this.description,
    };
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
