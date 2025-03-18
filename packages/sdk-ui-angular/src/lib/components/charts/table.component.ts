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
  Table,
  type TableProps as TablePropsPreact,
  ComponentAdapter,
  createElement,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';
import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../../component-wrapper-helpers';
import { template, rootId } from '../../component-wrapper-helpers/template';
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
 * ```html
 *  <csdk-table [dataSet]="table.dataSet" [dataOptions]="table.dataOptions" [filters]="filters" />
 * ```
 * ```ts
import { Component } from '@angular/core';
import { measureFactory, filterFactory } from '@sisense/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent {
  DM = DM;
  filters = [filterFactory.members(DM.Divisions.Divison_name, ['Cardiology', 'Neurology'])];
  table = {
    dataSet: DM.DataSource,
    dataOptions: {
      columns: [DM.Admissions.Patient_ID, measureFactory.sum(DM.Admissions.Cost_of_admission)],
    },
  };

}
 * ```
 * <img src="media://angular-table-chart-example.png" width="800px" />
 *
 * @group Data Grids
 */
@Component({
  selector: 'csdk-table',
  template,
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
   * @internal
   */
  @Input()
  dataReady: TableProps['dataReady'];

  private componentAdapter: ComponentAdapter;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(
      () => this.createPreactComponent(),
      [
        createSisenseContextConnector(this.sisenseContextService),
        createThemeContextConnector(this.themeService),
      ],
    );
  }

  /** @internal */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement);
  }

  /** @internal */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement);
    }
  }

  private createPreactComponent() {
    const props = {
      dataSet: this.dataSet,
      dataOptions: this.dataOptions,
      filters: this.filters,
      styleOptions: this.styleOptions,
      onDataReady: this.dataReady,
    };

    return createElement(Table, props);
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
