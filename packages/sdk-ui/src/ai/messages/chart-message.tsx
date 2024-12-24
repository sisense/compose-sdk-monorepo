import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import { useMemo, useState } from 'react';
import { WidgetContainerStyleOptions } from '../../types';
import { ChartWidget } from '../../widgets/chart-widget';
import { NlqResponseData } from '../api/types';
import CloseDialogIcon from '../icons/close-dialog-icon';
import ChartMessageToolbar from './chart-message-toolbar';
import { widgetComposer } from '@/analytics-composer';
import { isChartWidgetProps } from '@/widget-by-id/utils';
import { TranslatableError } from '@/translation/translatable-error';
import { isTable } from '@/chart-options-processor/translations/types';
import { useThemeContext } from '@/theme-provider';

type ChartMessageProps = {
  content: NlqResponseData;
};

export default function ChartMessage({ content }: ChartMessageProps) {
  const [expanded, setExpanded] = useState(false);
  const { themeSettings } = useThemeContext();

  const { inlineElement, expandedElement } = useMemo(() => {
    // Chart in message uses custom style options
    const widgetProps = widgetComposer.toWidgetProps(content, { useCustomizedStyleOptions: true });
    if (widgetProps === undefined || !isChartWidgetProps(widgetProps)) {
      throw new TranslatableError('errors.otherWidgetTypesNotSupported');
    }

    const { detailedDescription } = content;
    const { styleOptions } = widgetProps;

    const widgetStyleOptions: WidgetContainerStyleOptions = {
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

    let inlineElement: JSX.Element;
    let expandedElement: JSX.Element;
    if (isTable(widgetProps.chartType)) {
      inlineElement = (
        <div className="csdk-h-[245px]">
          <ChartWidget {...widgetProps} styleOptions={widgetStyleOptions} />
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
          <ChartWidget {...widgetProps} styleOptions={inlineStyleOptions} />
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
  }, [content]);

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
