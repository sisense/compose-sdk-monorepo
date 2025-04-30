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
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../../component-wrapper-helpers';
import { rootId, template } from '../../component-wrapper-helpers/template';
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
   */
  @Input()
  dataReady: TableProps['dataReady'];

  private componentAdapter: ComponentAdapter<typeof TablePreact>;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(TablePreact, [
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
