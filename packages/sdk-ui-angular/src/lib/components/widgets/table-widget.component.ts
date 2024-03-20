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
  TableWidget,
  type TableWidgetProps,
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

  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement);
  }

  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement);
    }
  }

  private createPreactComponent() {
    const props = {
      dataSource: this.dataSource,
      dataOptions: this.dataOptions,
      filters: this.filters,
      styleOptions: this.styleOptions,
      title: this.title,
      description: this.description,
    };

    return createElement(TableWidget, props);
  }

  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
