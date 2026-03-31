import { ReactNode } from 'react';

/**
 * Custom Widget Provider component that allows registering and accessing custom widgets.
 *
 * @internal
 */
export const CustomWidgetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
