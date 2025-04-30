import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  createSisenseContextConnector,
  createThemeContextConnector,
  SisenseContextService,
  ThemeService,
} from '@sisense/sdk-ui-angular';
import { ComponentAdapter } from '@sisense/sdk-ui-preact';
import {
  Chatbot as ChatbotPreact,
  type ChatbotProps as ChatbotPropsPreact,
} from '@sisense/sdk-ui-preact/ai';

import { createAiContextConnector } from '../component-wrapper-helpers';
import { rootId, template } from '../component-wrapper-helpers/template';
import { AiService } from '../services/ai.service';

/**
 * Props of the {@link ChatbotComponent}.
 */
export interface ChatbotProps extends ChatbotPropsPreact {}

/**
 * An Angular component that renders a chatbot with data topic selection.
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
 * <img src="media://angular-chatbot-example.png" width="500px" />
 * @group Generative AI
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

  private componentAdapter: ComponentAdapter<typeof ChatbotPreact>;

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
    this.componentAdapter = new ComponentAdapter(ChatbotPreact, [
      createSisenseContextConnector(this.sisenseContextService),
      createThemeContextConnector(this.themeService),
      createAiContextConnector(this.aiService),
    ]);
  }

  /**
   * @internal
   */
  ngAfterViewInit() {
    this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
  }

  /**
   * @internal
   */
  ngOnChanges() {
    if (this.preactRef) {
      this.componentAdapter.render(this.preactRef.nativeElement, this.getPreactComponentProps());
    }
  }

  private getPreactComponentProps(): ChatbotPropsPreact {
    return {
      width: this.width,
      height: this.height,
      config: this.config,
    };
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.componentAdapter.destroy();
  }
}
