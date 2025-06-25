import { render } from '@testing-library/react';

import { CustomWidget } from './custom-widget';
import * as DM from '@/__test-helpers__/sample-ecommerce';

import { useCustomWidgets } from '@/custom-widgets-provider';
import { useSisenseContext } from '@/sisense-context/sisense-context';

vi.mock('@/custom-widgets-provider');
vi.mock('@/sisense-context/sisense-context');

import { Mock } from 'vitest';

describe('CustomWidget', () => {
  const mockUseCustomWidgets = useCustomWidgets as unknown as Mock;
  const mockUseSisenseContext = useSisenseContext as unknown as Mock;

  // We'll store a fake custom widget map in memory
  const customWidgetMap = new Map<string, (props: any) => JSX.Element>();

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

    // By default, no custom widgets in the map; can add in individual tests
    customWidgetMap.clear();
    mockUseCustomWidgets.mockReturnValue({
      registerCustomWidget: vi.fn(),
      hasCustomWidget: vi.fn((key: string) => customWidgetMap.has(key)),
      getCustomWidget: vi.fn((key: string) => customWidgetMap.get(key)),
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
    expect(customWidgetComponentMock).toHaveBeenCalledOnce();
    expect(customWidgetComponentMock.mock.calls[0]).toMatchSnapshot();

    // Our custom widget text is now rendered
    expect(getByText('Custom Widget Content')).toBeInTheDocument();
  });
});
