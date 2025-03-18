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
import { Chatbot, type ChatbotProps as ChatbotPropsPreact } from '@sisense/sdk-ui-preact/ai';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  SisenseContextService,
  ThemeService,
  createSisenseContextConnector,
  createThemeContextConnector,
} from '@sisense/sdk-ui-angular';
import { template, rootId } from '../component-wrapper-helpers/template';
import { AiService } from '../services/ai.service';
import { createAiContextConnector } from '../component-wrapper-helpers';

/**
 * Props of the {@link ChatbotComponent}.
 */
export interface ChatbotProps extends ChatbotPropsPreact {}

/**
 * An Angular component that renders a chatbot with data topic selection.
 *
 * ::: warning Note
 * This component is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
 * :::
 *
 * @example
 * An example of using the `ChatbotComponent`:
 *
 * ```html
<!--Component HTML template in example.component.html-->
<csdk-chatbot
  [width]="chatbot.width"
  [height]="chatbot.height"
  [config]="chatbot.config"
/>
 * ```
 *
 * ```ts
// Component behavior in example.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
})
export class ExampleComponent {
  chatbot = {
    width: '500px',
    height: '700px',
    config: {
      numOfRecommendations: 5,
    },
  };
}
 * ```
 *
 * <img src="media://angular-chatbot-example.png" width="800px" />
 * @shortDescription Angular component that renders a chatbot with data topic selection.
 *
 * @group Generative AI
 * @beta
 */
@Component({
  selector: 'csdk-chatbot',
  template,
})
export class ChatbotComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * @internal
   */
  @ViewChild(rootId)
  preactRef!: ElementRef<HTMLDivElement>;

  /**
   * {@inheritDoc @sisense/sdk-ui!ChatbotProps.width}
   */
  @Input()
  width: ChatbotProps['width'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChatbotProps.height}
   */
  @Input()
  height: ChatbotProps['height'];

  /**
   * {@inheritDoc @sisense/sdk-ui!ChatbotProps.config}
   */
  @Input()
  config: ChatbotProps['config'];

  private componentAdapter: ComponentAdapter;

  /**
   * Constructor for the `ChatbotComponent`.
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
      width: this.width,
      height: this.height,
      config: this.config,
    };

    return createElement(Chatbot, props);
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
