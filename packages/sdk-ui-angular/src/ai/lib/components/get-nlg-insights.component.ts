import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ComponentAdapter, createElement } from '@sisense/sdk-ui-preact';
import {
  GetNlgInsights,
  type GetNlgInsightsProps as GetNlgInsightsPropsPreact,
} from '@sisense/sdk-ui-preact/ai';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  SisenseContextService,
  ThemeService,
  createSisenseContextConnector,
  createThemeContextConnector,
} from '@sisense/sdk-ui-angular';
import { AiService } from '../services/ai.service';
import { createAiContextConnector } from '../component-wrapper-helpers';
import { template, rootId } from '../component-wrapper-helpers/template';

/**
 * Props of the {@link GetNlgInsightsComponent}.
 */
export interface GetNlgInsightsProps extends GetNlgInsightsPropsPreact {}

/**
 * An Angular component that fetches and displays a collapsible analysis of the provided query using natural language generation (NLG).
 * Specifying NLG parameters is similar to providing parameters to the {@link QueryService.executeQuery} service method, using dimensions, measures, and filters.
 *
 * ::: warning Note
 * This component is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
 * :::
 *
 * @example
 * An example of using the `GetNlgInsightsComponent`:
 *
 * ```html
<!--Component HTML template in example.component.html-->
<csdk-get-nlg-insights
  [dataSource]="nlgParams.dataSource"
  [dimensions]="nlgParams.dimensions"
  [measures]="nlgParams.measures"
/>
 * ```
 *
 * ```ts
// Component behavior in example.component.ts
import { Component } from '@angular/core';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from '../../assets/sample-healthcare-model';

@Component({
  selector: 'example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
  nlgParams = {
    dataSource: DM.DataSource.title,
    dimensions: [DM.Divisions.Divison_name],
    measures: [measureFactory.sum(DM.Admissions.Cost_of_admission)],
  };
}
 * ```
 *
 * <img src="media://angular-get-nlg-insights-example.png" width="700px" />
 *
 * @group Generative AI
 * @beta
 */
@Component({
  selector: 'csdk-get-nlg-insights',
  template,
})
export class GetNlgInsightsComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!GetNlgInsightsProps.dataSource}
   */
  @Input()
  dataSource!: GetNlgInsightsProps['dataSource'];

  /**
   * {@inheritDoc @sisense/sdk-ui!GetNlgInsightsProps.dimensions}
   */
  @Input()
  dimensions: GetNlgInsightsProps['dimensions'];

  /**
   * {@inheritDoc @sisense/sdk-ui!GetNlgInsightsProps.measures}
   */
  @Input()
  measures: GetNlgInsightsProps['measures'];

  /**
   * {@inheritDoc @sisense/sdk-ui!GetNlgInsightsProps.filters}
   */
  @Input()
  filters: GetNlgInsightsProps['filters'];

  /**
   * {@inheritDoc @sisense/sdk-ui!GetNlgInsightsProps.verbosity}
   */
  @Input()
  verbosity: GetNlgInsightsProps['verbosity'];

  private componentAdapter: ComponentAdapter;

  /**
   * Constructor for the `GetNlgInsightsProps`.
   *
   * @param sisenseContextService - Sisense context service
   * @param themeService - Theme service
   * @param aiService - AI service
   */
  constructor(
    /**
     * Sisense context service
     *
     * @category Constructor
     */
    public sisenseContextService: SisenseContextService,
    /**
     * Theme service
     *
     * @category Constructor
     */
    public themeService: ThemeService,
    /**
     * AI service
     *
     * @category Constructor
     */
    public aiService: AiService,
  ) {
    this.componentAdapter = new ComponentAdapter(
      () => this.createPreactComponent(),
      [
        createSisenseContextConnector(this.sisenseContextService),
        createThemeContextConnector(this.themeService),
        createAiContextConnector(this.aiService),
      ],
    );
  }

  /**
   * @internal
   */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement);
  }

  /**
   * @internal
   */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement);
    }
  }

  private createPreactComponent() {
    const props = {
      dataSource: this.dataSource,
      dimensions: this.dimensions,
      measures: this.measures,
      filters: this.filters,
      verbosity: this.verbosity,
    };

    return createElement(GetNlgInsights, props);
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
