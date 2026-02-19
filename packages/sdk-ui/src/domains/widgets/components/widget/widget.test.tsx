import { measureFactory } from '@sisense/sdk-data';
import { render } from '@testing-library/react';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import { CommonWidget } from '../common-widget';
import { WidgetProps } from './types';
import { Widget } from './widget';

// Mock the CommonWidget component
vi.mock('../common-widget', () => ({
  CommonWidget: vi.fn(() => <div>Mocked CommonWidget</div>),
}));

describe('Widget Component', () => {
  const mockWidgetProps: WidgetProps = {
    id: 'widget-1',
    widgetType: 'chart',
    chartType: 'indicator',
    dataOptions: {
      value: [measureFactory.sum(DM.Commerce.Cost)],
    },
  };

  it('renders CommonWidget with correct props', () => {
    const { getByText } = render(<Widget {...mockWidgetProps} />);

    // Check if the mocked CommonWidget is rendered
    expect(getByText('Mocked CommonWidget')).toBeInTheDocument();

    // Verify that CommonWidget received the correct props
    expect(CommonWidget).toHaveBeenCalledWith(expect.objectContaining(mockWidgetProps), undefined);
  });

  it('uses the widget id as a key', () => {
    render(<Widget {...mockWidgetProps} />);

    // Verify the `key` prop is set correctly on CommonWidget
    expect(CommonWidget).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'widget-1' }),
      undefined,
    );
  });
});
