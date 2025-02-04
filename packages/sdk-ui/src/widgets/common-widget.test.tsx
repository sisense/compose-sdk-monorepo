import { render } from '@testing-library/react';
import { CommonWidget } from './common-widget';
import { ChartWidget } from '@/widgets/chart-widget';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { CommonWidgetProps, WidgetProps } from '@/props';
import { measureFactory } from '@sisense/sdk-data';

// Mock child widgets
vi.mock('@/widgets/pivot-table-widget', () => ({
  PivotTableWidget: vi.fn(() => <div>Mocked PivotTableWidget</div>),
}));

vi.mock('@/widgets/chart-widget', () => ({
  ChartWidget: vi.fn(() => <div>Mocked ChartWidget</div>),
}));

vi.mock('@/widgets/text-widget', () => ({
  TextWidget: vi.fn(() => <div>Mocked TextWidget</div>),
}));

vi.mock('@/widgets/plugin-widget', () => ({
  PluginWidget: vi.fn(() => <div>Mocked PluginWidget</div>),
}));

describe('CommonWidget Component', () => {
  const pluginWidgetProps: WidgetProps = {
    id: 'widget-plugin',
    widgetType: 'plugin',
    pluginType: 'test-plugin',
    title: 'Test Plugin',
    dataOptions: {},
  };

  const pivotTableWidgetProps: WidgetProps = {
    id: 'widget-pivot',
    widgetType: 'pivot',
    dataOptions: {},
  };

  const textWidgetProps: WidgetProps = {
    id: 'widget-text',
    widgetType: 'text',
    styleOptions: {
      html: 'ololo',
      vAlign: 'valign-middle',
      bgColor: 'white',
    },
  };

  const chartWidgetProps: WidgetProps = {
    id: 'widget-chart',
    widgetType: 'chart',
    chartType: 'indicator',
    dataOptions: {
      value: [measureFactory.sum(DM.Commerce.Cost)],
    },
  };

  it('renders PluginWidget for plugin widget props', () => {
    const { getByText } = render(<CommonWidget {...pluginWidgetProps} />);
    expect(getByText('Mocked PluginWidget')).toBeInTheDocument();
  });

  it('renders PivotTableWidget for pivot table widget props', () => {
    const { getByText } = render(<CommonWidget {...pivotTableWidgetProps} />);
    expect(getByText('Mocked PivotTableWidget')).toBeInTheDocument();
  });

  it('renders TextWidget for text widget props', () => {
    const { getByText } = render(<CommonWidget {...textWidgetProps} />);
    expect(getByText('Mocked TextWidget')).toBeInTheDocument();
  });

  it('renders ChartWidget for chart widget props with highlightSelectionDisabled=true', () => {
    const { getByText } = render(<CommonWidget {...chartWidgetProps} />);
    expect(getByText('Mocked ChartWidget')).toBeInTheDocument();
    expect(ChartWidget).toHaveBeenCalledWith(
      expect.objectContaining({ highlightSelectionDisabled: true }),
      expect.anything(),
    );
  });

  it('renders nothing if no widget type matches', () => {
    const invalidProps = {
      widgetType: 'unknown-widget',
      unknownProp: 'unknown',
    } as unknown as CommonWidgetProps;
    const { container } = render(<CommonWidget {...invalidProps} />);
    expect(container.textContent).toBe('');
  });
});
