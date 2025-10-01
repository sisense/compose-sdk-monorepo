import { type CustomContextProviderProps } from '@ethings-os/sdk-ui';

import { AnyComponentFunction } from './types';
import { DataObserver } from './utils/data-observer';

/** @internal */
export type ContextConnector<P extends CustomContextProviderProps<any>> = {
  propsObserver: DataObserver<P>;
  providerComponent: AnyComponentFunction<P>;
};
