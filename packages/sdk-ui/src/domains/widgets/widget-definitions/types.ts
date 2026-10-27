import type { FunctionComponent, ReactNode } from 'react';

import type { CustomVisualization, DesignPanel } from '@/infra/plugins/widget-plugins/types';

import type { WidgetMetadata } from './widget-metadata';

/**
 * Structural constraint every visualization props interface satisfies (chart, pivot, custom).
 *
 * @internal
 */
export interface VisualizationLikeProps {
  /** Data options of the visualization. */
  dataOptions: object;
  /** Style options of the visualization. */
  styleOptions?: object;
}

/**
 * Describes one visualization widget type: its {@link WidgetMetadata} plus the React parts the
 * plugin manifest uses (`visualization`, `designPanel`).
 *
 * `Props` stays strict for authored definitions (for example `WidgetDefinition<LineChartProps>`).
 * Heterogeneous collections store {@link ErasedWidgetDefinition}s instead.
 *
 * @typeParam Props - Props of the visualization component.
 * @internal
 */
export type WidgetDefinition<Props extends VisualizationLikeProps = VisualizationLikeProps> =
  WidgetMetadata & {
    /** Icon shown in the widget type selector. */
    readonly icon?: () => ReactNode;
    /** Widget-level configuration. */
    readonly config?: {
      /** Configuration of the widget header. */
      readonly header?: {
        /** Whether the header is visible. Visible when not specified. */
        readonly visible?: boolean;
      };
    };
    /** The chrome-less body of the widget. */
    readonly visualization: {
      /** Component rendering the body. */
      readonly Component: FunctionComponent<Props>;
    };
    /** Design panel editing the widget's style options. */
    readonly designPanel?: {
      /** Component rendering the design panel. */
      readonly Component?: DesignPanel<NonNullable<Props['styleOptions']>>;
    };
  };

/**
 * Props seen through an erased definition. Opaque: forwarded to the body, never inspected.
 *
 * @internal
 */
export type ErasedVisualizationProps = { readonly [prop: string]: unknown };

/**
 * A {@link WidgetDefinition} with erased prop types, for heterogeneous storage (the built-in map
 * and the registry). Create one with `eraseWidgetDefinition` and render it with `renderWidgetBody`.
 *
 * @internal
 */
export type ErasedWidgetDefinition = Omit<WidgetDefinition, 'visualization' | 'designPanel'> & {
  /** The chrome-less body of the widget, with erased props. */
  readonly visualization: {
    /**
     * Component rendering the body. Typed as a synchronous component, which every widget body is,
     * so it can be handed to readers that expect a custom visualization.
     */
    readonly Component: CustomVisualization<ErasedVisualizationProps>;
  };
  /** Design panel editing the widget's style options, with erased style options. */
  readonly designPanel?: {
    /** Component rendering the design panel. */
    readonly Component?: DesignPanel<unknown>;
  };
};
