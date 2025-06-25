import { ReactNode } from 'react';
import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import { GenericDataOptions } from '@/types';

/**
 * Props passed to a user-defined custom widget component.
 */
export interface CustomWidgetComponentProps<DataOptions = GenericDataOptions, StyleOptions = any> {
  dataSource?: DataSource;
  dataOptions: DataOptions;
  styleOptions: StyleOptions;
  filters?: Filter[] | FilterRelations;
  highlights?: Filter[];
  description?: string;
}

/**
 * A user-defined custom widget component. This is can be specified when registering a
 * custom widget with `registerCustomWidget` from the `useCustomWidgets` hook.
 */
export type CustomWidgetComponent<Props = CustomWidgetComponentProps> = (props: Props) => ReactNode;
