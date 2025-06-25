import { ReactNode, useRef } from 'react';
import { CustomWidgetsContext } from './custom-widgets-context';
import { CustomWidgetComponent } from './types';

/**
 * Custom Widget Provider component that allows registering and accessing custom widgets.
 *
 * @internal
 */
export const CustomWidgetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const customWidgesMapRef = useRef(new Map<string, CustomWidgetComponent<any>>());

  return (
    <CustomWidgetsContext.Provider value={customWidgesMapRef.current}>
      {children}
    </CustomWidgetsContext.Provider>
  );
};
