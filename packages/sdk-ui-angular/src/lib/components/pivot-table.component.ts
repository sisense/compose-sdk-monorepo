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
  PivotTable,
  ComponentAdapter,
  createElement,
  type PivotTableProps,
} from '@sisense/sdk-ui-preact';
import { SisenseContextService } from '../services';
import { ThemeService } from '../services';
import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../component-wrapper-helpers';
import { template, rootId } from '../component-wrapper-helpers/template';

/**
 * Pivot Table with and pagination.
 *
 * @alpha
 */
@Component({
  selector: 'csdk-pivot-table',
  template,
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
   * {@inheritDoc @sisense/sdk-ui!PivotTableProps.styleOptions}
   *
   * @category Representation
   */
  @Input()
  styleOptions: PivotTableProps['styleOptions'];

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

    return createElement(PivotTable, props);
  }

  /** @internal */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
