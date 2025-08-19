import { render } from '@testing-library/react';
import { CommonWidget } from './common-widget';
import type { WidgetProps, CommonWidgetProps } from '@/props';
import { ChartWidget } from '@/widgets/chart-widget';
import * as DM from '@/__test-helpers__/sample-ecommerce';

// Mock child widgets:
vi.mock('@/widgets/pivot-table-widget', () => ({
  PivotTableWidget: vi.fn(() => <div>Mocked PivotTableWidget</div>),
}));

vi.mock('@/widgets/chart-widget', () => ({
  ChartWidget: vi.fn(() => <div>Mocked ChartWidget</div>),
}));

vi.mock('@/widgets/text-widget', () => ({
  TextWidget: vi.fn(() => <div>Mocked TextWidget</div>),
}));

vi.mock('@/widgets/custom-widget', () => ({
  CustomWidget: vi.fn(() => <div>Mocked CustomWidget</div>),
}));

describe('CommonWidget Component', () => {
  const customWidgetProps: WidgetProps = {
    id: 'widget-custom',
    widgetType: 'custom',
    customWidgetType: 'test-custom-widget',
    title: 'Test Custom Widget',
    dataOptions: {},
    dataSource: DM.DataSource,
  };

  const chartWidgetProps: WidgetProps = {
    id: 'widget-chart',
    widgetType: 'chart',
    chartType: 'line',
    title: 'Test Chart',
    dataOptions: {
      category: [DM.Commerce.Date.Years],
      value: [DM.Commerce.Revenue],
    },
    dataSource: DM.DataSource,
  };

  const pivotTableWidgetProps: WidgetProps = {
    id: 'widget-pivot',
    widgetType: 'pivot',
    title: 'Test Pivot Table',
    dataOptions: {
      rows: [DM.Commerce.Date.Years],
      columns: [DM.Commerce.Gender],
      values: [DM.Commerce.Revenue],
    },
    dataSource: DM.DataSource,
  };

  const textWidgetProps: WidgetProps = {
    id: 'widget-text',
    widgetType: 'text',
    styleOptions: {
      html: 'Test text content',
      vAlign: 'valign-middle' as const,
      bgColor: 'white',
    },
  };

  it('renders CustomWidget for custom widget props', () => {
    const { getByText } = render(<CommonWidget {...customWidgetProps} />);
    expect(getByText('Mocked CustomWidget')).toBeInTheDocument();
  });

  it('renders ChartWidget for chart widget props', () => {
    const { getByText } = render(<CommonWidget {...chartWidgetProps} />);
    expect(getByText('Mocked ChartWidget')).toBeInTheDocument();
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
      undefined,
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
