import type React from 'react';

import { render } from '@testing-library/react';
import { Mock } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useWidgetPluginRegistry } from '@/infra/plugins/use-widget-plugin-registry';

import { CustomWidget } from './custom-widget';

vi.mock('@/infra/plugins/use-widget-plugin-registry');
vi.mock('@/infra/contexts/sisense-context/sisense-context');

describe('CustomWidget', () => {
  const mockUseWidgetPluginRegistry = useWidgetPluginRegistry as unknown as Mock;
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
    mockUseWidgetPluginRegistry.mockReturnValue({
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
});
