import React, { FunctionComponent, useEffect, useState } from 'react';

import {
  type CustomVisualizationProps,
  SisenseContextProvider,
  ThemeProvider,
  type ThemeSettings,
  type WidgetPlugin,
} from '@sisense/sdk-ui';

export interface DevAppProps {
  /** The plugin to preview — must include a `customWidget` declaration */
  plugin: WidgetPlugin;
  /** Initial props passed to the visualization component */
  chartProps: CustomVisualizationProps;
  url?: string;
  token?: string;
  theme?: ThemeSettings;
}

export const DevApp = ({ url, token, plugin, chartProps, theme = {} }: DevAppProps) => {
  if (!url || !token) {
    return <EnvWarning />;
  }

  return (
    <SisenseContextProvider
      url={url}
      token={token}
      plugins={[plugin]}
      showRuntimeErrors={true}
      appConfig={{
        errorBoundaryConfig: {
          alwaysShowErrorText: true,
        },
      }}
    >
      <ThemeProvider theme={theme}>
        <PluginPreview plugin={plugin} chartProps={chartProps} />
      </ThemeProvider>
    </SisenseContextProvider>
  );
};

interface PluginPreviewProps {
  plugin: WidgetPlugin;
  chartProps: CustomVisualizationProps;
}

const PluginPreview = ({ plugin, chartProps }: PluginPreviewProps) => {
  const [styleOptions, setStyleOptions] = useState(chartProps.styleOptions);

  useEffect(() => {
    setStyleOptions(chartProps.styleOptions);
  }, [chartProps.styleOptions]);

  const customWidget = plugin.customWidget;

  if (!customWidget) {
    return <MissingCustomWidgetWarning pluginName={plugin.name} />;
  }

  const { visualization, designPanel } = customWidget;
  const DesignPanelComponent = designPanel?.Component;
  const ChartComponent = visualization.Component as FunctionComponent<CustomVisualizationProps>;

  return (
    <div className="app-container">
      <div className="widget-container">
        <div className="widget-chart">
          <ChartComponent {...chartProps} styleOptions={styleOptions} />
        </div>
        {DesignPanelComponent && (
          <div className="widget-panels">
            <DesignPanelComponent styleOptions={styleOptions ?? {}} onChange={setStyleOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

const MissingCustomWidgetWarning = ({ pluginName }: { pluginName: string }) => {
  /* eslint-disable i18next/no-literal-string */
  return (
    <div className="env-warning">
      <div className="env-warning-content">
        <div className="env-warning-title">No custom widget defined</div>
        <p className="env-warning-message">
          Plugin <strong>{pluginName}</strong> does not define a <code>customWidget</code>.
        </p>
        <p className="env-warning-hint">
          Add a <code>customWidget</code> declaration to your plugin object with at least a{' '}
          <code>visualization.Component</code> to preview it here.
        </p>
      </div>
    </div>
  );
};

export const EnvWarning = () => {
  /* eslint-disable i18next/no-literal-string */
  return (
    <div className="env-warning">
      <div className="env-warning-content">
        <div className="env-warning-title">Configuration required</div>
        <p className="env-warning-message">
          Sisense URL and token were not found in environment variables. The app cannot connect to
          Sisense without them.
        </p>
        <p className="env-warning-hint">
          Set VITE_APP_SISENSE_URL and VITE_APP_SISENSE_TOKEN in your .env file, then restart the
          dev server.
        </p>
      </div>
    </div>
  );
};
