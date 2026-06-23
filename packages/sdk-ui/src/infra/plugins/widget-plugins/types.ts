import { FunctionComponent, ReactNode } from 'react';

import type { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import type { DeepPartial } from 'ts-essentials';

import { AnyObject } from '@/shared/utils/utility-types';
import type { AbstractDataPointWithEntries, GenericDataOptions } from '@/types';

import type { BasePluginInfo } from '../types';

/**
 * Declares a widget plugin for registration with the Compose SDK.
 *
 * Pass an instance to the `plugins` prop on {@link SisenseContextProvider} to register a custom
 * visualization that appears in the dashboard widget picker.
 *
 * @typeParam Props - Props type for the custom visualization component, extending {@link CustomVisualizationProps}.
 * @group Plugin System
 * @example
 * ```tsx
 * import { WidgetPlugin, CustomVisualization } from '@sisense/sdk-ui';
 *
 * const MyChart: CustomVisualization = ({ dataOptions }) => <div>{String(dataOptions)}</div>;
 *
 * const myPlugin: WidgetPlugin = {
 *   name: 'my-widget-plugin',
 *   version: '1.0.0',
 *   requiredApiVersion: '^2.9.0',
 *   pluginType: 'widget',
 *   customWidget: {
 *     name: 'my-widget',
 *     displayName: 'My Widget',
 *     visualization: { Component: MyChart },
 *   },
 * };
 * ```
 * @beta
 */
export interface WidgetPlugin<
  // The constraint uses `any` generics so plugin authors can supply a strongly
  // typed `CustomOptions` (e.g. `interface MyOptions { lastPage?: number }`)
  // without it having to be assignable to `Record<string, unknown>` (object
  // types without an index signature are not). The default keeps the strict shape.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Props extends CustomVisualizationProps<any, any, any, any> = CustomVisualizationProps,
> extends BasePluginInfo {
  /**
   * The type of plugin
   */
  pluginType: 'widget';
  /**
   * The custom widget declaration to be registered
   */
  customWidget?: {
    /**
     * The unique name of the custom widget type (used for registration and identification)
     * @example 'my-custom-widget'
     */
    name: string;
    /**
     * The display name of the custom widget type (used for display in the UI)
     * @example 'My Custom Widget'
     */
    displayName: string;

    /**
     * Configuration options for the custom widget
     */
    config?: {
      /**
       * Configuration options for the widget header
       */
      header?: {
        /**
         * Whether the header is visible.
         * If not specified, the header is visible by default.
         * @example true
         */
        visible?: boolean;
      };
    };

    /**
     * Definition of the custom visualization to be rendered in the new custom widget
     */
    visualization: {
      /**
       * The custom visualization component to be rendered in the new custom widget
       */
      Component: CustomVisualization<Props>;
    };

    /**
     * Definition of the design panel for the custom widget
     */
    designPanel?: {
      Component?: DesignPanel<NonNullable<Props['styleOptions']>>;
    };

    /**
     * The icon of the custom widget to be displayed in the widget selector
     * @example
     * ```tsx
     * const MyWidgetIcon = () => <PieChartIcon />;
     * ```
     * @internal
     */
    icon?: () => ReactNode;

    /**
     * Definition of the data panel for the custom widget
     */
    dataPanel?: {
      /**
       * Configuration options for the data panel
       * @example
       * ```tsx
       * {
       *   inputs: [
       *     { name: 'category', displayName: 'Category', type: 'dimension' },
       *     { name: 'value', displayName: 'Value', type: 'measure' },
       *   ],
       * }
       * ```
       */
      config?: {
        /**
         * Inputs for the data panel
         * @example
         * ```tsx
         * [
         *   { name: 'category', displayName: 'Category', type: 'dimension' },
         *   { name: 'value', displayName: 'Value', type: 'measure' },
         * ]
         * ```
         */
        inputs?: {
          /**
           * The name of the input
           * @example 'category'
           */
          name: string;
          /**
           * The display name of the input
           * @example 'Category'
           */
          displayName?: string;
          /**
           * The type of the input
           */
          type: 'dimension' | 'measure';
          /**
           * The minimum number of items that can be selected
           * @example 1
           */
          minItems?: number;
          /**
           * The maximum number of items that can be selected
           * @example 5
           */
          maxItems?: number;
          /**
           * Whether the items can be sorted
           */
          canSort?: boolean;
          /**
           * Whether the items can be formatted
           */
          canFormat?: boolean;
          /**
           * Whether the items can be colored
           */
          canColor?: boolean;
        }[];
      };
    };
  };
}

/**
 * Any Widget plugin declaration
 * Represents heterogeneous widget plugin declarations at registry/context boundaries.
 * Generic params are intentionally erased because each plugin can define distinct props/style types.
 * Do not consume component prop types from this alias directly.
 *
 * @sisenseInternal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyWidgetPlugin = WidgetPlugin<any>;

/**
 * Defines props passed to a user-defined custom visualization component.
 *
 * @typeParam DataOptions - The shape of data options for this custom visualization.
 * @typeParam StyleOptions - The shape of style options for this custom visualization.
 * @typeParam DataPoint - The shape of data points passed to event handlers.
 * @typeParam CustomOptions - The shape of arbitrary plugin-specific state (not data- or style-related).
 * @group Plugin System
 * @example
 * ```tsx
 * import {
 *   CustomVisualization,
 *   CustomVisualizationProps,
 *   CustomVisualizationDataPoint,
 *   StyledColumn,
 *   StyledMeasureColumn,
 *   DataPointEntry,
 *   GenericDataOptions,
 * } from '@sisense/sdk-ui';
 *
 * interface MyDataOptions extends GenericDataOptions {
 *   category: StyledColumn[];
 *   value: StyledMeasureColumn[];
 * }
 *
 * interface MyDataPoint extends CustomVisualizationDataPoint {
 *   entries: {
 *     category: DataPointEntry[];
 *     value: DataPointEntry[];
 *   };
 * }
 *
 * type MyChartProps = CustomVisualizationProps<MyDataOptions, {}, MyDataPoint>;
 *
 * const MyChart: CustomVisualization<MyChartProps> = ({ dataOptions, onDataPointClick }) => {
 *   return <div>My Chart</div>;
 * };
 * ```
 * @beta
 */
export interface CustomVisualizationProps<
  DataOptions = GenericDataOptions,
  StyleOptions = CustomVisualizationStyleOptions,
  DataPoint extends AbstractDataPointWithEntries = AbstractDataPointWithEntries,
  CustomOptions = Record<string, unknown>,
> extends CustomVisualizationEventProps<DataPoint> {
  /** Data source for the custom visualization */
  dataSource?: DataSource;
  /** Data options defining what data to display */
  dataOptions: DataOptions;
  /** Style options for customizing appearance */
  styleOptions?: StyleOptions;
  /** Filters to apply to the data */
  filters?: Filter[] | FilterRelations;
  /** Highlight filters for interactive highlighting */
  highlights?: Filter[];
  /**
   * Arbitrary plugin-specific options that is not data- or style-related.
   *
   * @sisenseInternal
   */
  customOptions?: CustomOptions;
  /**
   * Emit a partial state update to be persisted through the dashboard
   * persistence layer. Injected by the dashboard when the widget lives inside a
   * Dashboard component; `undefined` in standalone use or read-only mode — always
   * call it with optional chaining.
   *
   * @example
   * ```tsx
   * onChange?.({ customOptions: { lastPage: 3 } });
   * ```
   *
   * @sisenseInternal
   */
  onChange?: (update: VisualizationStateUpdate<StyleOptions, CustomOptions>) => void;
}

/**
 * Partial persistable state a custom visualization can push back to the
 * persistence layer. Carries the same props vocabulary the plugin already reads
 * from.
 *
 * Both fields are deeply partial and are deep-merged into the current widget
 * state: nested plain objects merge recursively at any depth, so a plugin
 * passes only the leaf values that changed — e.g.
 * `{ styleOptions: { pagination: { currentPage: 3 } } }` updates `currentPage`
 * while preserving the sibling `pagination` keys. Arrays and primitives are
 * replaced wholesale (last-write-wins). Keys cannot be deleted via merge —
 * overwrite with an explicit value (e.g. `null`) instead.
 *
 * @sisenseInternal
 */
export type VisualizationStateUpdate<
  StyleOptions = CustomVisualizationStyleOptions,
  CustomOptions = Record<string, unknown>,
> = {
  styleOptions?: DeepPartial<StyleOptions>;
  customOptions?: DeepPartial<CustomOptions>;
};

/**
 * Defines style options for a custom visualization.
 *
 * Extend this interface to add plugin-specific style properties passed via `styleOptions`.
 *
 * @group Plugin System
 * @example
 * ```ts
 * interface MyWidgetStyleOptions extends CustomVisualizationStyleOptions {
 *   backgroundColor?: string;
 *   fontSize?: number;
 * }
 * ```
 * @beta
 */
export interface CustomVisualizationStyleOptions extends AnyObject {}

/**
 * Defines a user-defined custom visualization component.
 * Can be any visual representation of data — chart, table, map, etc.
 *
 * @typeParam Props - The props type for the custom visualization component, extending {@link CustomVisualizationProps}.
 * @param props - Props injected by the dashboard, including `dataOptions`, `styleOptions`, `filters`, and event handlers.
 * @returns A React node representing the rendered visualization.
 * @group Plugin System
 * @example
 * ```tsx
 * import { CustomVisualization, CustomVisualizationProps } from '@sisense/sdk-ui';
 *
 * const MyChart: CustomVisualization<CustomVisualizationProps> = ({ dataOptions, styleOptions }) => {
 *   return <div className="my-chart">{JSON.stringify(dataOptions)}</div>;
 * };
 * ```
 * @beta
 */
export type CustomVisualization<Props = CustomVisualizationProps> = (props: Props) => ReactNode;

/**
 * A custom visualization with erased prop types, used for heterogeneous storage
 * at registry/context boundaries. Each concrete visualization specializes
 * {@link CustomVisualizationProps} differently (and may require extra props such
 * as a widget `id`), so the registry cannot know each exact shape — the prop
 * type is intentionally erased here. Do not consume prop types from this alias.
 *
 * @sisenseInternal
 */
export type AnyCustomVisualization = CustomVisualization<any>;

/**
 * Defines event handler props for a custom visualization component.
 *
 * Included automatically via {@link CustomVisualizationProps}. Extend to add custom event props.
 *
 * @typeParam DataPoint - The shape of data points for this custom visualization.
 * @group Plugin System
 * @example
 * ```tsx
 * interface MyEventProps extends CustomVisualizationEventProps<MyDataPoint> {
 *   onCustomAction?: (id: string) => void;
 * }
 * ```
 * @beta
 */
export interface CustomVisualizationEventProps<
  DataPoint extends AbstractDataPointWithEntries = AbstractDataPointWithEntries,
> {
  /**
   * Click handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointClick?: CustomVisualizationDataPointEventHandler<DataPoint>;

  /**
   * Context menu handler callback for a data point
   *
   * @category Callbacks
   */
  onDataPointContextMenu?: CustomVisualizationDataPointContextMenuHandler<DataPoint>;

  /**
   * Handler callback for selection of multiple data points
   *
   * @category Callbacks
   */
  onDataPointsSelected?: CustomVisualizationDataPointsEventHandler<DataPoint>;
}

/**
 * Defines an event handler for a data point click in a custom visualization.
 *
 * @typeParam T - The shape of the data point.
 * @group Plugin System
 * @example
 * ```tsx
 * const handleClick: CustomVisualizationDataPointEventHandler<MyChartDataPoint> = (point, event) => {
 *   console.log('Clicked:', point.entries.category[0].value);
 * };
 * ```
 * @beta
 */
export type CustomVisualizationDataPointEventHandler<
  T extends AbstractDataPointWithEntries = AbstractDataPointWithEntries,
> = (
  /** Data point that was clicked. */
  point: CustomVisualizationDataPoint<T>,
  /** Native browser pointer or mouse event. */
  nativeEvent: PointerEvent | MouseEvent,
) => void;

/**
 * Represents a single data point in a custom visualization.
 *
 * Extend `AbstractDataPointWithEntries` to define typed entries for your widget's data options.
 * Instances are passed to event handlers such as `onDataPointClick`.
 *
 * @typeParam T - The concrete data point shape, extending {@link AbstractDataPointWithEntries}.
 * @group Plugin System
 * @example
 * ```ts
 * import { CustomVisualizationDataPoint, DataPointEntry } from '@sisense/sdk-ui';
 *
 * interface MyChartDataPoint extends CustomVisualizationDataPoint {
 *   entries: {
 *     category: DataPointEntry[];
 *     value: DataPointEntry[];
 *   };
 * }
 *
 * const onDataPointClick = (point: MyChartDataPoint) => {
 *   console.log('Clicked category:', point.entries.category[0].value);
 * };
 * ```
 * @beta
 */
export type CustomVisualizationDataPoint<
  T extends AbstractDataPointWithEntries = AbstractDataPointWithEntries,
> = T;

/**
 * Defines an event handler for a data point context-menu event in a custom visualization.
 *
 * @typeParam T - The shape of the data point.
 * @group Plugin System
 * @example
 * ```tsx
 * const handleContextMenu: CustomVisualizationDataPointContextMenuHandler<MyChartDataPoint> = (
 *   point,
 *   event,
 * ) => {
 *   event.preventDefault();
 *   showContextMenu({ x: event.clientX, y: event.clientY, point });
 * };
 * ```
 * @beta
 */
export type CustomVisualizationDataPointContextMenuHandler<
  T extends AbstractDataPointWithEntries = AbstractDataPointWithEntries,
> = (
  /** Data point that triggered the context menu */
  point: CustomVisualizationDataPoint<T>,
  /** Native browser event */
  nativeEvent: MouseEvent,
) => void;

/**
 * Defines an event handler for multi-point selection in a custom visualization.
 *
 * @typeParam T - The shape of the data point.
 * @group Plugin System
 * @example
 * ```tsx
 * const handleSelect: CustomVisualizationDataPointsEventHandler<MyChartDataPoint> = (
 *   points,
 *   event,
 * ) => {
 *   console.log('Selected:', points.length, 'points');
 * };
 * ```
 * @beta
 */
export type CustomVisualizationDataPointsEventHandler<
  T extends AbstractDataPointWithEntries = AbstractDataPointWithEntries,
> = (
  /** Data points that were selected */
  points: CustomVisualizationDataPoint<T>[],
  /** Native browser event */
  nativeEvent: MouseEvent,
) => void;

/**
 * Defines props passed to a custom design panel component.
 *
 * @typeParam StyleOptions - The shape of style options managed by this design panel, extending {@link CustomVisualizationStyleOptions}.
 * @group Plugin System
 * @example
 * ```tsx
 * import { DesignPanel, DesignPanelProps } from '@sisense/sdk-ui';
 *
 * interface MyStyleOptions extends CustomVisualizationStyleOptions {
 *   color?: string;
 * }
 *
 * const MyDesignPanel: DesignPanel<MyStyleOptions> = ({ styleOptions, onChange }) => (
 *   <input
 *     type="color"
 *     value={styleOptions.color ?? '#000000'}
 *     onChange={(e) => onChange({ ...styleOptions, color: e.target.value })}
 *   />
 * );
 * ```
 * @beta
 */
export interface DesignPanelProps<StyleOptions = CustomVisualizationStyleOptions> {
  /** Current style options managed by the design panel. */
  styleOptions: StyleOptions;
  /** Callback invoked when the user changes a style option. */
  onChange: (styleOptions: StyleOptions) => void;
}

/**
 * Defines a design panel component for a custom widget.
 *
 * Renders inside the widget's style/design settings pane and receives the current
 * `styleOptions` and an `onChange` callback to persist style changes.
 *
 * @typeParam StyleOptions - The shape of style options managed by this design panel, extending {@link CustomVisualizationStyleOptions}.
 * @group Plugin System
 * @example
 * ```tsx
 * import { DesignPanel, CustomVisualizationStyleOptions } from '@sisense/sdk-ui';
 *
 * interface MyStyleOptions extends CustomVisualizationStyleOptions {
 *   color?: string;
 * }
 *
 * const MyDesignPanel: DesignPanel<MyStyleOptions> = ({ styleOptions, onChange }) => (
 *   <input
 *     type="color"
 *     value={styleOptions.color ?? '#000000'}
 *     onChange={(e) => onChange({ ...styleOptions, color: e.target.value })}
 *   />
 * );
 * ```
 * @beta
 */
export type DesignPanel<StyleOptions = CustomVisualizationStyleOptions> = FunctionComponent<
  DesignPanelProps<StyleOptions>
>;
