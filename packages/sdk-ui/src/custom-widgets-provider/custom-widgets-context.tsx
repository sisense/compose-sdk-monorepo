import { createContext } from 'react';
import { CustomWidgetComponent } from './types';

/**
 * Context for custom widgets.
 *
 * @internal
 */
export const CustomWidgetsContext = createContext<Map<string, CustomWidgetComponent<any>> | null>(
  null,
);
