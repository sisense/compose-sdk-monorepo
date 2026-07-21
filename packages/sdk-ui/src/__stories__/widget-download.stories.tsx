import { DataSource } from '@sisense/sdk-data';
import { Meta } from '@storybook/react-vite';

import { ChartWidget } from '@/domains/widgets/components/chart-widget';

import { templateForComponent } from './template';

const template = templateForComponent(ChartWidget);

const meta: Meta<typeof ChartWidget> = {
  title: 'Widget/Download',
  component: ChartWidget,
};
export default meta;

// `ChartWidget` queries a server-side data source, so the story targets one explicitly
// (rather than inline `Data`) to keep the export input contract type-checked.
const dataSource: DataSource = { title: 'Sample ECommerce', type: 'elasticube' };

const baseArgs = {
  // `id` identifies the widget for the data-export request.
  id: 'excel-download-demo-widget',
  chartType: 'column' as const,
  dataSource,
  dataOptions: {
    category: [{ name: 'Years', type: 'date' }],
    value: [{ column: { name: 'Quantity', aggregation: 'sum' }, showOnRightAxis: false }],
    breakBy: [],
  },
};

/**
 * Enabling `config.actions.downloadExcel` adds a "Download → Excel File" item to the
 * widget's header menu, letting the user export the widget's data as an XLSX file.
 */
export const WithExcelDownload = template({
  ...baseArgs,
  title: 'Widget With Excel Download',
  config: {
    actions: {
      downloadExcel: { enabled: true },
    },
  },
});

/**
 * Both CSV and Excel download actions can be enabled together; the two items share a single
 * "Download" group in the header menu.
 */
export const WithCsvAndExcelDownload = template({
  ...baseArgs,
  title: 'Widget With CSV and Excel Download',
  config: {
    actions: {
      downloadCsv: { enabled: true },
      downloadExcel: { enabled: true },
    },
  },
});
