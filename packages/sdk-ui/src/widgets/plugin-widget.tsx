import { DynamicSizeContainer, getWidgetDefaultSize } from '@/dynamic-size-container';
import ErrorBoundaryBox from '@/error-boundary/error-boundary-box';
import { usePlugins } from '@/plugins-provider';
import { PluginComponentProps } from '@/plugins-provider/types';
import { PluginWidgetProps } from '@/props';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { getDataSourceName } from '@sisense/sdk-data';
import { WidgetContainer } from './common/widget-container';
import { useTranslation } from 'react-i18next';

/**
 * Component that renders a plugin widget.
 *
 * @internal
 */
export const PluginWidget: React.FC<PluginWidgetProps> = (widgetProps) => {
  const { t } = useTranslation();
  const { plugins } = usePlugins();
  const { app } = useSisenseContext();

  const renderPlugin = plugins.get(widgetProps.pluginType);
  if (!renderPlugin) {
    return (
      <ErrorBoundaryBox
        error={t('plugins.registerPrompt', { pluginType: widgetProps.pluginType })}
      />
    );
  }

  const dataSource = widgetProps.dataSource ?? app?.defaultDataSource;
  const pluginProps: PluginComponentProps = {
    dataSource,
    dataOptions: widgetProps.dataOptions,
    styleOptions: widgetProps.styleOptions,
    filters: widgetProps.filters,
    highlights: widgetProps.highlights,
  };

  return (
    <DynamicSizeContainer defaultSize={getWidgetDefaultSize('line', { hasHeader: true })}>
      <WidgetContainer
        title={widgetProps.title}
        description={widgetProps.description}
        dataSetName={dataSource && getDataSourceName(dataSource)}
      >
        {renderPlugin(pluginProps)}
      </WidgetContainer>
    </DynamicSizeContainer>
  );
};
