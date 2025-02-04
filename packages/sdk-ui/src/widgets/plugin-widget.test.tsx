import { render } from '@testing-library/react';

import { PluginWidget } from './plugin-widget';
import * as DM from '@/__test-helpers__/sample-ecommerce';

import { usePlugins } from '@/plugins-provider';
import { useSisenseContext } from '@/sisense-context/sisense-context';

vi.mock('@/plugins-provider');
vi.mock('@/sisense-context/sisense-context');

import { Mock } from 'vitest';

describe('PluginWidget', () => {
  const mockUsePlugins = usePlugins as unknown as Mock;
  const mockUseSisenseContext = useSisenseContext as unknown as Mock;

  // We'll store a fake plugin map in memory
  const pluginMap = new Map<string, (props: any) => JSX.Element>();

  beforeEach(() => {
    vi.clearAllMocks();

    // By default, context returns a fallback dataSource
    mockUseSisenseContext.mockReturnValue({
      isInitialized: true,
      app: {
        defaultDataSource: DM.DataSource,
      },
      errorBoundary: {
        showErrorBox: true,
      },
    });

    // By default, no plugins in the map; can add in individual tests
    pluginMap.clear();
    mockUsePlugins.mockReturnValue({
      plugins: {
        get: (key: string) => pluginMap.get(key),
      },
    });
  });

  it('renders an error if plugin is not found', () => {
    const { getByRole } = render(
      <PluginWidget pluginType="unknown-plugin" dataOptions={{}} title={''} />,
    );

    // So let's look for that text in the DOM:
    expect(getByRole('generic', { name: 'error-box' })).toBeInTheDocument();
  });

  it('renders plugin when plugin is found', () => {
    const pluginComponentMock = vi.fn(() => <div>Plugin Content</div>);
    // Add a plugin to the map that just returns some text
    pluginMap.set('my-plugin', pluginComponentMock);

    const { getByText, queryByRole } = render(
      <PluginWidget
        pluginType="my-plugin"
        dataOptions={{ someProp: [] }}
        title={'My awesome plugin'}
        filters={[]}
        highlights={[]}
        styleOptions={{
          someStyle: 'value',
        }}
      />,
    );

    // The error boundary text should not appear
    expect(queryByRole('generic', { name: 'error-box' })).not.toBeInTheDocument();

    // And our plugin component was called
    expect(pluginComponentMock).toHaveBeenCalledOnce();
    expect(pluginComponentMock.mock.calls[0]).toMatchSnapshot();

    // Our plugin text is now rendered
    expect(getByText('Plugin Content')).toBeInTheDocument();
  });
});
