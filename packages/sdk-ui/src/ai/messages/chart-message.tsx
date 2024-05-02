import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import { Filter } from '@sisense/sdk-data';
import { useMemo, useState } from 'react';
import { ChartWidgetProps, TableWidgetProps } from '../../props';
import { ChartType, TableType, WidgetStyleOptions } from '../../types';
import { ChartWidget } from '../../widgets/chart-widget';
import { TableWidget } from '../../widgets/table-widget';
import { NlqResponseData } from '../api/types';
import CloseDialogIcon from '../icons/close-dialog-icon';
import ChartMessageToolbar from './chart-message-toolbar';
import {
  getChartOptions,
  getChartRecommendationsOrDefault,
  getTableOptions,
} from './get-widget-options';
import { createJaqlElement } from './jaql-element';

type ChartMessageProps = {
  content: NlqResponseData;
  dataSource: string;
};

export default function ChartMessage({ content, dataSource }: ChartMessageProps) {
  const [expanded, setExpanded] = useState(false);

  const { chartElement, expandedElement } = useMemo(() => {
    const { detailedDescription, jaql } = content;

    const chartRecommendations = getChartRecommendationsOrDefault(content);

    const chartType = chartRecommendations.chartType.toLowerCase() as ChartType | TableType;
    const widgetStyleOptions: WidgetStyleOptions = {
      cornerRadius: 'Small',
      header: {
        renderToolbar: (onRefresh) => (
          <ChartMessageToolbar
            infoTooltipText={detailedDescription}
            onRefresh={onRefresh}
            onExpand={() => setExpanded(true)}
          />
        ),
      },
    };
    const filters = jaql.metadata
      .filter((item) => item.panel === 'scope')
      .map(createJaqlElement) as unknown as Filter[];
    const metadata = jaql.metadata.filter((item) => item.panel !== 'scope');

    let chartElement: JSX.Element;
    let expandedElement: JSX.Element;
    if (chartType === 'table') {
      const { dataOptions } = getTableOptions(metadata);

      const tableWidgetProps: TableWidgetProps = {
        dataOptions,
        dataSource,
        filters,
      };

      chartElement = (
        <div className="csdk-h-[245px]">
          <TableWidget {...tableWidgetProps} styleOptions={widgetStyleOptions} />
        </div>
      );
      expandedElement = (
        <TableWidget {...tableWidgetProps} styleOptions={{ header: { hidden: true } }} />
      );
    } else {
      const { dataOptions, chartStyleOptions, expandedChartStyleOptions } = getChartOptions(
        metadata,
        chartRecommendations,
      );

      const styleOptions = { ...chartStyleOptions, ...widgetStyleOptions };

      const chartWidgetProps: ChartWidgetProps = {
        chartType,
        dataOptions,
        dataSource,
        filters,
      };

      chartElement = (
        <div>
          <ChartWidget {...chartWidgetProps} styleOptions={styleOptions} />
        </div>
      );

      const expandedStyleOptions = {
        ...expandedChartStyleOptions,
        header: { hidden: true },
      };
      expandedElement = <ChartWidget {...chartWidgetProps} styleOptions={expandedStyleOptions} />;
    }
    return { chartElement, expandedElement };
  }, [content, dataSource]);

  return (
    <>
      {chartElement}
      <Dialog open={expanded} onClose={() => setExpanded(false)} maxWidth="xl" fullWidth>
        <div className="csdk-flex csdk-items-center csdk-justify-between csdk-py-[30px] csdk-px-[40px]">
          <div className="csdk-text-ai-lg csdk-semibold csdk-text-text-active">
            {content.queryTitle}
          </div>
          <IconButton onClick={() => setExpanded(false)} aria-label="close expanded chart">
            <CloseDialogIcon />
          </IconButton>
        </div>
        <div className="csdk-h-screen">{expandedElement}</div>
      </Dialog>
    </>
  );
}
