import type { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import type {
  AbstractDataPointWithEntries,
  CustomWidgetEventProps,
  CustomWidgetStyleOptions,
  GenericDataOptions,
} from '@sisense/sdk-ui-preact';

/**
 * Props passed to a user-defined custom widget component.
 *
 * @typeParam DataOptions - The shape of data options for this custom widget
 * @typeParam StyleOptions - The shape of style options for this custom widget
 * @typeParam DataPoint - The shape of data points for event handlers
 *
 * @example
 * ```ts
 * import { Component, Input } from '@angular/core';
 * import {
 *   CustomWidgetComponentProps,
 *   CustomWidgetsService,
 *   GenericDataOptions,
 *   AbstractDataPointWithEntries,
 *   DataPointEntry,
 *   StyledColumn,
 *   StyledMeasureColumn,
 * } from '@sisense/sdk-ui-angular';
 * import type { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
 *
 * interface MyDataOptions extends GenericDataOptions {
 *   category: StyledColumn[];
 *   value: StyledMeasureColumn[];
 * }
 *
 * interface MyDataPoint extends AbstractDataPointWithEntries {
 *   entries: {
 *     category: DataPointEntry[];
 *     value: DataPointEntry[];
 *   };
 * }
 *
 * type MyWidgetProps = CustomWidgetComponentProps<MyDataOptions, object, MyDataPoint>;
 *
 * @Component({
 *   selector: 'app-my-widget',
 *   template: `<div>My Custom Widget</div>`,
 * })
 * export class MyWidgetComponent implements MyWidgetProps {
 *   @Input() dataOptions!: MyDataOptions;
 *   @Input() dataSource?: DataSource;
 *   @Input() styleOptions?: object;
 *   @Input() filters?: Filter[] | FilterRelations;
 *   @Input() highlights?: Filter[];
 *   @Input() description?: string;
 *   @Input() onDataPointClick?: (point: MyDataPoint, nativeEvent: MouseEvent) => void;
 *   @Input() onDataPointContextMenu?: (point: MyDataPoint, nativeEvent: MouseEvent) => void;
 *   @Input() onDataPointsSelected?: (points: MyDataPoint[], nativeEvent: MouseEvent) => void;
 * }
 *
 * // In AppModule or a component, register the custom widget:
 * constructor(private customWidgets: CustomWidgetsService) {
 *   this.customWidgets.registerCustomWidget('my-widget', MyWidgetComponent);
 * }
 * ```
 */
export interface CustomWidgetComponentProps<
  DataOptions = GenericDataOptions,
  StyleOptions = CustomWidgetStyleOptions,
  DataPoint extends AbstractDataPointWithEntries = AbstractDataPointWithEntries,
> extends CustomWidgetEventProps<DataPoint> {
  /** Data source for the custom widget */
  dataSource?: DataSource;
  /** Data options defining what data to display */
  dataOptions: DataOptions;
  /** Style options for customizing appearance */
  styleOptions?: StyleOptions;
  /** Filters to apply to the data */
  filters?: Filter[] | FilterRelations;
  /** Highlight filters for interactive highlighting */
  highlights?: Filter[];
  /** Description of the widget */
  description?: string;
}
