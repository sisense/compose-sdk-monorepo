import { ReactNode } from 'react';

import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';

import { AbstractDataPointWithEntries } from '@/domains/dashboarding/common-filters/types';
import { CustomWidgetEventProps, CustomWidgetStyleOptions, GenericDataOptions } from '@/types';

/**
 * Props passed to a user-defined custom widget component.
 *
 * @typeParam DataOptions - The shape of data options for this custom widget
 * @typeParam StyleOptions - The shape of style options for this custom widget
 * @typeParam DataPoint - The shape of data points for event handlers
 *
 * @example
 * ```tsx
 * import { CustomWidgetComponent, CustomWidgetComponentProps, CustomWidgetDataPoint, StyledColumn, StyledMeasureColumn, DataPointEntry, GenericDataOptions} from '@sisense/sdk-ui';
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
 * type MyWidgetProps = CustomWidgetComponentProps<MyDataOptions, {}, MyDataPoint>;
 *
 * const MyWidget: CustomWidgetComponent<MyWidgetProps> = (props) => {
 *   const { dataOptions, onDataPointClick } = props;
 *   // ... implementation based on props
 *   return <div>My Custom Widget</div>;
 * };
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

/**
 * A user-defined custom widget component. This is can be specified when registering a
 * custom widget with `registerCustomWidget` from the `useCustomWidgets` hook.
 *
 * @typeParam Props - The props type for the custom widget component
 */
export type CustomWidgetComponent<Props = CustomWidgetComponentProps> = (props: Props) => ReactNode;
