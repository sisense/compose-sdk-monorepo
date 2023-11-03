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
import { SisenseContextService } from '../services/sisense-context.service';
import { ThemeService } from '../services/theme.service';
import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../component-wrapper-helpers';
import { template, rootId } from '../component-wrapper-helpers/template';

/**
 * Table Widget Component
 *
 * @internal
 */
@Component({
  selector: 'csdk-table-widget',
  template,
})
export class TableWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  @Input()
  dataSource: TableWidgetProps['dataSource'];

  @Input()
  dataOptions!: TableWidgetProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: TableWidgetProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.styleOptions}
   *
   * @category Representation
   */
  @Input()
  styleOptions: TableWidgetProps['styleOptions'];

  @Input()
  widgetStyleOptions: TableWidgetProps['widgetStyleOptions'];

  @Input()
  title: TableWidgetProps['title'];

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
      widgetStyleOptions: this.widgetStyleOptions,
      title: this.title,
      description: this.description,
    };

    return createElement(TableWidget, props);
  }

  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
