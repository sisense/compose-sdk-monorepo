import { render, waitFor } from '@testing-library/react';

import { WidgetDefinitionRegistry } from '@/domains/widgets/widget-definitions';
import { PluginContext } from '@/infra/plugins/plugin-context';

import { CustomWidgetsProviderAdapter } from './custom-widgets-provider-adapter';
import type { CustomWidgetComponent } from './types';

describe('CustomWidgetsProviderAdapter', () => {
  it('throws when error is provided', () => {
    const error = new Error('adapter error');

    expect(() =>
      render(
        <CustomWidgetsProviderAdapter error={error}>
          <div />
        </CustomWidgetsProviderAdapter>,
      ),
    ).toThrow(error);
  });

  it('registers customWidgetsMap entries into the plugin registry', async () => {
    const widget: CustomWidgetComponent = () => null;
    const customWidgetsMap = new Map<string, CustomWidgetComponent>([['example', widget]]);
    const widgetRegistry = new WidgetDefinitionRegistry();

    render(
      <PluginContext.Provider value={{ widgetPlugins: [], widgetRegistry }}>
        <CustomWidgetsProviderAdapter context={{ customWidgetsMap }}>
          <div data-testid="child" />
        </CustomWidgetsProviderAdapter>
      </PluginContext.Provider>,
    );

    await waitFor(() => {
      expect(widgetRegistry.hasComponent('example')).toBe(true);
      expect(widgetRegistry.getComponent('example')).toBe(widget);
    });
  });
});
