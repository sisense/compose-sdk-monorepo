import { FunctionComponent, ReactNode } from 'react';

import type { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import { AnyObject } from '@/shared/utils/utility-types';
import type { AbstractDataPointWithEntries, GenericDataOptions } from '@/types';

import type { BasePluginInfo } from '../types';

/**
 * Widget plugin declaration.
 *
 * @sisenseInternal
 */
export interface WidgetPlugin<
  Props = CustomVisualizationProps,
  StyleOptions = CustomVisualizationStyleOptions,
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
      Component?: DesignPanel<StyleOptions>;
    };

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
        }[];
      };

      /**
       * The icon of the custom widget to be displayed in the widget selector
       * @example
       * ```tsx
       * const MyWidgetIcon = () => <PieChartIcon />;
       * ```
       */
      icon?: () => ReactNode;
    };
  };
}

/**
 * Props passed to a user-defined custom visualization component.
 *
 * @typeParam DataOptions - The shape of data options for this custom visualization
 * @typeParam StyleOptions - The shape of style options for this custom visualization
 * @typeParam DataPoint - The shape of data points for event handlers
 *
 * @example
 * ```tsx
 * import { CustomVisualization, CustomVisualizationProps, CustomWidgetDataPoint, StyledColumn, StyledMeasureColumn, DataPointEntry, GenericDataOptions} from '@sisense/sdk-ui';
 *
 * interface MyDataOptions extends GenericDataOptions {
 *   category: StyledColumn[];
 *   value: StyledMeasureColumn[];
 * }
 *
 * interface MyDataPoint extends CustomWidgetDataPoint {
 *   entries: {
 *     category: DataPointEntry[];
 *     value: DataPointEntry[];
 *   };
 * }
 *
 * type MyNewChartProps = CustomVisualizationProps<MyDataOptions, {}, MyDataPoint>;
 *
 * const MyNewChart: CustomVisualization<MyNewChartProps> = (props) => {
 *   const { dataOptions, onDataPointClick } = props;
 *   // ... implementation based on props
 *   return <div>My New Awesome Chart</div>;
 * };
 * ```
 *
 * @sisenseInternal
 */
export interface CustomVisualizationProps<
  DataOptions = GenericDataOptions,
  StyleOptions = CustomVisualizationStyleOptions,
  DataPoint extends AbstractDataPointWithEntries = AbstractDataPointWithEntries,
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
}

/**
 * Style options for a custom visualization.
 *
 * @sisenseInternal
 */
export interface CustomVisualizationStyleOptions extends AnyObject {}

/**
 * A user-defined custom visualization component.
 * This can be any visual representation of the data - chart, table, map, etc.
 *
 * @typeParam Props - The props type for the custom visualization component
 * @sisenseInternal
 */
export type CustomVisualization<Props = CustomVisualizationProps> = (props: Props) => ReactNode;

/**
 * Event props for custom visualizations with generic data point type.
 *
 * @typeParam DataPoint - The shape of data points for this custom visualization
 * @sisenseInternal
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
 * Generic event handler for custom visualization data point click.
 *
 * @typeParam T - The shape of the data point
 * @example
 * ```tsx
 * const handleClick: CustomVisualizationDataPointEventHandler<MyChartDataPoint> = (point, event) => {
 *   console.log('Clicked:', point.label, point.value);
 * };
 * ```
 *
 * @sisenseInternal
 */
export type CustomVisualizationDataPointEventHandler<
  T extends AbstractDataPointWithEntries = AbstractDataPointWithEntries,
> = (point: CustomVisualizationDataPoint<T>, nativeEvent: PointerEvent | MouseEvent) => void;

/**
 * Represents a single data point in a custom visualization.
 *
 * This type is used to define the structure of a data point that is passed to event handlers
 * like `onDataPointClick`. It typically extends `AbstractDataPointWithEntries` to include
 * specific entries for categories, values, or other dimensions used in the widget.
 *
 * @example
 * ```typescript
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
 *
 * @sisenseInternal
 */
export type CustomVisualizationDataPoint<
  T extends AbstractDataPointWithEntries = AbstractDataPointWithEntries,
> = T;

/**
 * Generic event handler for custom widget data point context menu.
 *
 * @typeParam T - The shape of the data point
 * @sisenseInternal
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
 * Generic event handler for custom visualization data points selection.
 *
 * @typeParam T - The shape of the data point
 * @example
 * ```tsx
 * const handleSelect: CustomVisualizationDataPointsEventHandler<MyChartDataPoint> = (points, event) => {
 *   console.log('Selected:', points.length, 'points');
 * };
 * ```
 *
 * @sisenseInternal
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
 * Props for the design panel component for the custom widget.
 *
 * @sisenseInternal
 */
export interface DesignPanelProps<StyleOptions = CustomVisualizationStyleOptions> {
  styleOptions: StyleOptions;
  onChange: (styleOptions: StyleOptions) => void;
}

/**
 * The design panel component for the custom widget.
 *
 * @sisenseInternal
 */
export type DesignPanel<StyleOptions = CustomVisualizationStyleOptions> = FunctionComponent<
  DesignPanelProps<StyleOptions>
>;
