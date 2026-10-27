import type React from 'react';

import { render, screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { setup } from '@/__test-helpers__';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { MenuProvider } from '@/infra/contexts/menu-provider/menu-provider';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useWidgetDefinitionRegistry } from '@/infra/plugins/use-widget-definition-registry';

import { CustomWidget } from './custom-widget';

vi.mock('@/infra/plugins/use-widget-definition-registry');
vi.mock('@/infra/contexts/sisense-context/sisense-context');

describe('CustomWidget', () => {
  const mockUseWidgetDefinitionRegistry = useWidgetDefinitionRegistry as unknown as Mock;
  const mockUseSisenseContext = useSisenseContext as unknown as Mock;

  const customWidgetMap = new Map<string, (props: unknown) => React.JSX.Element>();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSisenseContext.mockReturnValue({
      isInitialized: true,
      app: {
        defaultDataSource: DM.DataSource,
      },
      errorBoundary: {
        showErrorBox: true,
      },
    });

    customWidgetMap.clear();
    mockUseWidgetDefinitionRegistry.mockReturnValue({
      getComponent: (key: string) => customWidgetMap.get(key),
    });
  });

  it('renders an error if custom widget is not found', () => {
    const { getByRole } = render(
      <CustomWidget customWidgetType="unknown-custom-widget" dataOptions={{}} title={''} />,
    );

    // So let's look for that text in the DOM:
    expect(getByRole('generic', { name: 'error-box' })).toBeInTheDocument();
  });

  it('renders custom widget when custom widget is found', () => {
    const customWidgetComponentMock = vi.fn(() => <div>Custom Widget Content</div>);
    // Add a custom widget to the map that just returns some text
    customWidgetMap.set('my-custom-widget', customWidgetComponentMock);

    const { getByText, queryByRole } = render(
      <CustomWidget
        customWidgetType="my-custom-widget"
        dataOptions={{ someProp: [] }}
        title={'My awesome custom widget'}
        filters={[]}
        highlights={[]}
        styleOptions={{
          someStyle: 'value',
        }}
      />,
    );

    // The error boundary text should not appear
    expect(queryByRole('generic', { name: 'error-box' })).not.toBeInTheDocument();

    // And our custom widget component was called
    expect(customWidgetComponentMock).toHaveBeenCalled();
    expect(customWidgetComponentMock.mock.calls[0]).toMatchSnapshot();

    // Our custom widget text is now rendered
    expect(getByText('Custom Widget Content')).toBeInTheDocument();
  });

  it('emits a committed rename as a title/changed event through onChange', async () => {
    customWidgetMap.set('my-custom-widget', () => <div>Custom Widget Content</div>);
    const onChange = vi.fn();

    const { user } = setup(
      <MenuProvider>
        <CustomWidget
          customWidgetType="my-custom-widget"
          dataOptions={{}}
          title="Custom Title"
          config={{ header: { title: { editing: { enabled: true } } } }}
          onChange={onChange}
        />
      </MenuProvider>,
    );

    await user.click(await screen.findByRole('button', { name: 'widget header menu' }));
    await user.click(await screen.findByText('Rename Widget'));
    const input = await screen.findByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Renamed Custom{Enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'Renamed Custom' },
    });
  });

  it('wraps a plugin state update into a visualizationState/changed event', () => {
    const customWidgetComponentMock = vi.fn((_props: unknown) => <div>Custom Widget Content</div>);
    customWidgetMap.set('my-custom-widget', customWidgetComponentMock);
    const onChange = vi.fn();

    render(
      <CustomWidget
        customWidgetType="my-custom-widget"
        dataOptions={{}}
        title="Custom Title"
        onChange={onChange}
      />,
    );

    const pluginProps = customWidgetComponentMock.mock.calls[0]?.[0] as {
      onChange?: (update: unknown) => void;
    };
    // The plugin gets an adapter that keeps its VisualizationStateUpdate API, not the widget callback.
    expect(pluginProps.onChange).toBeTypeOf('function');
    expect(pluginProps.onChange).not.toBe(onChange);

    pluginProps.onChange?.({ customOptions: { lastPage: 3 } });

    expect(onChange).toHaveBeenCalledWith({
      type: 'visualizationState/changed',
      payload: { customOptions: { lastPage: 3 } },
    });
  });

  it('passes no onChange to the plugin when the widget has none', () => {
    const customWidgetComponentMock = vi.fn((_props: unknown) => <div>Custom Widget Content</div>);
    customWidgetMap.set('my-custom-widget', customWidgetComponentMock);

    render(<CustomWidget customWidgetType="my-custom-widget" dataOptions={{}} title="Custom" />);

    const pluginProps = customWidgetComponentMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(pluginProps).not.toHaveProperty('onChange');
  });
});
