import { ReactNode } from 'react';
import { DataSource, Filter, FilterRelations } from '@sisense/sdk-data';
import { GenericDataOptions } from '@/types';

/**
 * Props passed to a user-defined widget component.
 *
 * @alpha
 */
export interface PluginComponentProps<DataOptions = GenericDataOptions, StyleOptions = any> {
  dataSource?: DataSource;
  dataOptions: DataOptions;
  styleOptions: StyleOptions;
  filters?: Filter[] | FilterRelations;
  highlights?: Filter[];
  description?: string;
}

/**
 * A user-defined widget component. This is can be specified when registering a
 * plugin with `registerPlugin` from the `usePlugins` hook.
 *
 * @alpha
 */
export type PluginComponent<Props = PluginComponentProps> = (props: Props) => ReactNode;
