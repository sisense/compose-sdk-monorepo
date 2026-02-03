import { PropsWithChildren } from 'react';

import { CustomContextProviderProps } from '../../../types';
import { CustomWidgetsContext } from './custom-widgets-context.js';
import { CustomWidgetComponent, CustomWidgetComponentProps } from './types.js';

/** @internal */
export type CustomWidgetsProviderAdapterProps = CustomContextProviderProps<
  CustomWidgetsContextAdapter<CustomWidgetComponentProps>
>;

/** @internal */
export type CustomWidgetsContextAdapter<T = CustomWidgetComponentProps> = {
  customWidgetsMap: Map<string, CustomWidgetComponent<T>>;
};

/**
 * Custom Widget Provider Adapter component that allows passing external custom widgets context.
 *
 * Note: it is designed to serve as a bridge for passing pre-initialized custom widget data between an external wrapper and child React components.
 *
 * @internal
 */
export const CustomWidgetsProviderAdapter: React.FC<
  PropsWithChildren<CustomWidgetsProviderAdapterProps>
> = (props) => {
  const { error, context, children } = props;

  if (error) {
    throw error;
  }

  const { customWidgetsMap } = context;

  return (
    <CustomWidgetsContext.Provider value={customWidgetsMap}>
      {children}
    </CustomWidgetsContext.Provider>
  );
};
