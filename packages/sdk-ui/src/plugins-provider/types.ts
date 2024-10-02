import { ReactNode } from 'react';
import { DataSource, Filter } from '@sisense/sdk-data';
import { GenericDataOptions } from '@/types';

/**
 * Props passed to a user-defined widget component.
 *
 * @alpha
 */
export interface PluginComponentProps {
  dataSource?: DataSource;
  dataOptions: GenericDataOptions;
  styleOptions: any;
  filters?: Filter[];
  highlights?: Filter[];
}

/**
 * A user-defined widget component. This is can be specified when registering a
 * plugin with `registerPlugin` from the `usePlugins` hook.
 *
 * @alpha
 */
export type PluginComponent = (props: PluginComponentProps) => ReactNode;
