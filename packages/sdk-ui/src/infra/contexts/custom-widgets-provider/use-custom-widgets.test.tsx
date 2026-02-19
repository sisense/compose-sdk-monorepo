import { PropsWithChildren } from 'react';

import { act, renderHook } from '@testing-library/react';

import { CustomWidgetsContext } from './custom-widgets-context';
import { CustomWidgetComponent } from './types';
import { useCustomWidgets } from './use-custom-widgets';

const createWrapper =
  (customWidgetsMap: Map<string, CustomWidgetComponent>) =>
  ({ children }: PropsWithChildren) =>
    (
      <CustomWidgetsContext.Provider value={customWidgetsMap}>
        {children}
      </CustomWidgetsContext.Provider>
    );

describe('useCustomWidgets', () => {
  it('throws when used outside CustomWidgetsProvider', () => {
    expect(() => renderHook(() => useCustomWidgets())).toThrow(
      'useCustomWidgets must be used within a CustomWidgetsProvider',
    );
  });

  it('registers and exposes custom widgets', () => {
    const customWidgetsMap = new Map<string, CustomWidgetComponent>();
    const Wrapper = createWrapper(customWidgetsMap);

    const widgetA: CustomWidgetComponent = vi.fn(() => null);
    const widgetB: CustomWidgetComponent = vi.fn(() => null);

    const { result } = renderHook(() => useCustomWidgets(), { wrapper: Wrapper });

    act(() => result.current.registerCustomWidget('widget-a', widgetA));

    expect(customWidgetsMap.get('widget-a')).toBe(widgetA);
    expect(result.current.hasCustomWidget('widget-a')).toBe(true);
    expect(result.current.getCustomWidget('widget-a')).toBe(widgetA);

    act(() => result.current.registerCustomWidget('widget-a', widgetB));

    expect(customWidgetsMap.get('widget-a')).toBe(widgetA);
    expect(result.current.hasCustomWidget('missing')).toBe(false);
  });
});
