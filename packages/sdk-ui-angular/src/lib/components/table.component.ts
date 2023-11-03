import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Table, type TableProps, ComponentAdapter, createElement } from '@sisense/sdk-ui-preact';
import { SisenseContextService } from '../services/sisense-context.service';
import { ThemeService } from '../services/theme.service';
import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../component-wrapper-helpers';
import { template, rootId } from '../component-wrapper-helpers/template';

/**
 * Table Component
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
   * {@inheritDoc @sisense/sdk-ui!ChartProps.dataSet}
   *
   * @category Data
   */
  @Input()
  dataSet: TableProps['dataSet'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.highlights}
   *
   * @category Data
   */
  @Input()
  dataOptions!: TableProps['dataOptions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.filters}
   *
   * @category Data
   */
  @Input()
  filters: TableProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.styleOptions}
   *
   * @category Representation
   */
  @Input()
  styleOptions: TableProps['styleOptions'];

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
    };

    return createElement(Table, props);
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
