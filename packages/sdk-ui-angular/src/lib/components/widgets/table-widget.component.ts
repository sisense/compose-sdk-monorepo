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
  TableWidget as TableWidgetPreact,
  type TableWidgetProps as TableWidgetPropsPreact,
} from '@sisense/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
  rootId,
  styles,
  template,
} from '../../component-wrapper-helpers';
import { SisenseContextService } from '../../services/sisense-context.service';
import { ThemeService } from '../../services/theme.service';

/**
 * Props of the {@link TableWidgetComponent}.
 *
 * @internal
 */
export interface TableWidgetProps extends TableWidgetPropsPreact {}

/**
 * The Table Widget component extending {@link TableComponent} component to support widget style options.
 *
 * @example
 * ```html
 *  <csdk-table-widget
 *    [dataSource]="table.dataSet"
 *    [dataOptions]="table.dataOptions"
 *    [filters]="filters"
 *    [title]="table.title"
 *    [description]="table.description"
 *  />
 * ```
 * ```ts
 * import { Component } from '@angular/core';
 * import { ChartType } from '@sisense/sdk-ui-angular';
 * import { filterFactory, measureFactory } from '@sisense/sdk-data';
 * import * as DM from '../../assets/sample-healthcare-model';
 *
 * @Component({
 *  selector: 'app-widgets',
 * templateUrl: './widgets.component.html',
 * styleUrls: ['./widgets.component.scss'],
 * })
 * export class WidgetsComponent {
 * filters = [filterFactory.members(DM.Divisions.Divison_name, ['Cardiology', 'Neurology'])];
 *
 * table = {
 *    dataSet: DM.DataSource,
 *    dataOptions: {
 *      columns: [DM.Admissions.Patient_ID, measureFactory.sum(DM.Admissions.Cost_of_admission)],
 *    }
 *    title: 'Widget Title',
 *    description: 'Widget Description',
 *  };
 * }
 * ```
 * <img src="media://angular-table-widget-example.png" width="800px" />
 * @internal
 */
@Component({
  selector: 'csdk-table-widget',
  template,
  styles,
})
export class TableWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** @internal */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!TableWidgetProps.dataSource}
   *
   * @category Data
   */
  @Input()
  dataSource: TableWidgetProps['dataSource'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TableWidgetProps.dataOptions}
   *
   * @category Data
   */
  @Input()
  dataOptions!: TableWidgetProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TableWidgetProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: TableWidgetProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TableWidgetProps.styleOptions}
   *
   * @category Representation
   */
  @Input()
  styleOptions: TableWidgetProps['styleOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TableWidgetProps.title}
   *
   * @category Widget
   */
  @Input()
  title: TableWidgetProps['title'];

  /**
   * {@inheritDoc @sisense/sdk-ui!TableWidgetProps.description}
   *
   * @category Widget
   */
  @Input()
  description: TableWidgetProps['description'];

  private componentAdapter: ComponentAdapter<typeof TableWidgetPreact>;

  constructor(
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {
    this.componentAdapter = new ComponentAdapter(TableWidgetPreact, [
      createSisenseContextConnector(this.sisenseContextService),
      createThemeContextConnector(this.themeService),
    ]);
  }

  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
  }

  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
    }
  }

  private getPreactComponentProps() {
    return {
      dataSource: this.dataSource,
      dataOptions: this.dataOptions,
      filters: this.filters,
      styleOptions: this.styleOptions,
      title: this.title,
      description: this.description,
    };
  }

  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
