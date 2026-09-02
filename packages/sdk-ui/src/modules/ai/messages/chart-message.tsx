import { useMemo, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';

import { isTable } from '@/domains/visualizations/core/chart-options-processor/translations/types';
import { ChartWidget } from '@/domains/widgets/components/chart-widget';
import type { ChartWidgetConfig } from '@/domains/widgets/components/widget';
import { isChartWidgetProps } from '@/domains/widgets/components/widget-by-id/utils';
import { WidgetHeaderTargets } from '@/domains/widgets/shared/widget-header/widget-header-targets';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { widgetComposer } from '@/modules/analytics-composer';

import { WidgetContainerStyleOptions } from '../../../types';
import { NlqResponseData } from '../api/types';
import CloseDialogIcon from '../icons/close-dialog-icon';
import ChartMessageToolbar from './chart-message-toolbar';

/** The message's own header toolbar: info, expand and the three-dots menu. */
const CHART_MESSAGE_TOOLBAR_ID = 'ai-chart-message-toolbar';
const CHART_MESSAGE_TOOLBAR_WIDTH = 84;

type ChartMessageProps = {
  content: NlqResponseData;
};

export default function ChartMessage({ content }: ChartMessageProps) {
  const [expanded, setExpanded] = useState(false);
  // The toolbar's "Refresh" remounts the inline chart, which re-runs its query. The widget's own
  // refresh is internal to it, so the message owns this instead of reaching inside the widget.
  const [refreshKey, setRefreshKey] = useState(0);
  const { themeSettings } = useThemeContext();

  const { inlineElement, expandedElement } = useMemo(() => {
    // Chart in expanded view uses custom style options, inline chart (message) will remove some options later in the code
    // Currently the REST API does not return widgetProps or store them in chat history .. if it does in future, should use it directly as content.widgetProps
    const widgetProps = widgetComposer.toWidgetProps(content, { useCustomizedStyleOptions: true });
    if (widgetProps === undefined || !isChartWidgetProps(widgetProps)) {
      throw new TranslatableError('errors.otherWidgetTypesNotSupported');
    }

    const { detailedDescription } = content;
    const { styleOptions } = widgetProps;

    const widgetStyleOptions: WidgetContainerStyleOptions = {
      cornerRadius: 'Small',
    };
    // The message shows its own toolbar instead of the widget's header actions. It states the header
    // it wants — title, the spacer that pushes the toolbar right, toolbar — rather than subtracting
    // the actions it doesn't, so a header item added by default later can't turn up here unnoticed.
    const widgetConfig: ChartWidgetConfig = {
      header: {
        onBeforeRender: (items) => [
          ...items.filter(
            (item) =>
              item.id === WidgetHeaderTargets.Title || item.id === WidgetHeaderTargets.Spacer,
          ),
          {
            id: CHART_MESSAGE_TOOLBAR_ID,
            size: { width: CHART_MESSAGE_TOOLBAR_WIDTH },
            component: () => (
              <ChartMessageToolbar
                infoTooltipText={detailedDescription}
                onRefresh={() => setRefreshKey((key) => key + 1)}
                onExpand={() => setExpanded(true)}
              />
            ),
          },
        ],
      },
    };

    let inlineElement: JSX.Element;
    let expandedElement: JSX.Element;
    if (isTable(widgetProps.chartType)) {
      inlineElement = (
        <div className="csdk-h-[245px]">
          <ChartWidget
            key={refreshKey}
            {...widgetProps}
            styleOptions={widgetStyleOptions}
            config={widgetConfig}
          />
        </div>
      );
      expandedElement = (
        <ChartWidget {...widgetProps} styleOptions={{ header: { hidden: true } }} />
      );
    } else {
      const expandedStyleOptions = {
        ...styleOptions,
        header: { hidden: true },
      };

      // inline style options do not include legend, yAxis, xAxis
      const inlineStyleOptions = {
        ...styleOptions,
        legend: undefined,
        xAxis: undefined,
        yAxis: undefined,
        ...widgetStyleOptions,
      };

      delete inlineStyleOptions.legend;
      delete inlineStyleOptions.xAxis;
      delete inlineStyleOptions.yAxis;

      inlineElement = (
        <div>
          <ChartWidget
            key={refreshKey}
            {...widgetProps}
            styleOptions={inlineStyleOptions}
            config={widgetConfig}
          />
        </div>
      );

      expandedElement = (
        <ChartWidget
          {...widgetProps}
          styleOptions={{ cornerRadius: 'None', ...expandedStyleOptions }}
        />
      );
    }
    return { inlineElement, expandedElement };
  }, [content, refreshKey]);

  return (
    <>
      {inlineElement}
      <Dialog
        open={expanded}
        onClose={() => setExpanded(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: themeSettings.chart.backgroundColor,
            color: themeSettings.aiChat.primaryTextColor,
          },
        }}
      >
        <div className="csdk-flex csdk-items-center csdk-justify-between csdk-mt-[16px] csdk-mx-[16px] csdk-pl-[20px]">
          <div className="csdk-text-ai-lg csdk-semibold">{content.queryTitle}</div>
          <IconButton onClick={() => setExpanded(false)} aria-label="close expanded chart">
            <CloseDialogIcon fillColor={themeSettings.aiChat.primaryTextColor} />
          </IconButton>
        </div>
        <div className="csdk-h-screen csdk-mt-[8px] csdk-mb-[24px] csdk-mx-[16px]">
          {expandedElement}
        </div>
      </Dialog>
    </>
  );
}
